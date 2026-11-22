import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findFirstMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
}))

vi.mock('@/src/server/db', () => ({
  prisma: {
    viewLog: {
      findFirst: findFirstMock,
    },
  },
}))

const userMessage = (content: string) => [{ role: 'user' as const, content }]
const soloGuest = ['charlie-munger'] as const

const eventBody = (events: string) => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(events))
      controller.close()
    },
  })
}

const sse = (...events: unknown[]) => events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('')

async function drain(result: AsyncGenerator<string> | { error: unknown }) {
  if ('error' in result) return
  for await (const chunk of result) {
    // 消费生成器，触发 in-flight 释放。
    void chunk
  }
}

describe('夜宴流式服务', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    const { chatStreamTestUtils } = await import('@/src/features/chat/services')
    chatStreamTestUtils.resetRateLimitState()
    chatStreamTestUtils.setDailyLimitForTest(100)
  })

  it('会在访问数据库前拒绝缺失的指纹', async () => {
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), '', [...soloGuest])).resolves.toEqual({
      error: 'INVALID_FINGERPRINT',
    })
    expect(findFirstMock).not.toHaveBeenCalled()
  })

  it('会在访问数据库前拒绝无效的宾客名单', async () => {
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1', [])).resolves.toEqual({ error: 'INVALID_GUEST' })
    await expect(streamChat(userMessage('hello'), 'fp-1', ['nobody'] as never)).resolves.toEqual({
      error: 'INVALID_GUEST',
    })
    await expect(streamChat(userMessage('hello'), 'fp-1', ['charlie-munger', 'charlie-munger'])).resolves.toEqual({
      error: 'INVALID_GUEST',
    })
    await expect(
      streamChat(userMessage('hello'), 'fp-1', ['charlie-munger', 'steve-jobs', 'richard-feynman', 'elon-musk']),
    ).resolves.toEqual({ error: 'INVALID_GUEST' })
    expect(findFirstMock).not.toHaveBeenCalled()
  })

  it('会拒绝无效指纹', async () => {
    findFirstMock.mockResolvedValue(null)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'INVALID_FINGERPRINT',
    })
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { fingerprint: 'fp-1' },
    })
  })

  it('会在调用上游前拒绝空消息数组', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat([], 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'INVALID_MESSAGE',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会拒绝非法角色', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat([{ role: 'system', content: 'hi' }] as never, 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'INVALID_MESSAGE',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会要求 assistant 消息带本桌宾客', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(
      streamChat([{ role: 'assistant', content: '你好' }] as never, 'fp-1', [...soloGuest]),
    ).resolves.toEqual({ error: 'INVALID_MESSAGE' })
    await expect(
      streamChat([{ role: 'assistant', content: '你好', guest: 'steve-jobs' }] as never, 'fp-1', [...soloGuest]),
    ).resolves.toEqual({ error: 'INVALID_MESSAGE' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会拒绝超长用户消息', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('a'.repeat(2001)), 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'MESSAGE_TOO_LONG',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会在上游响应失败时返回上游错误', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'UPSTREAM_ERROR',
    })
  })

  it('会透传上游的无效宾客错误', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'INVALID_GUEST' }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'INVALID_GUEST',
    })
  })

  it('会将完整历史、宾客和事件流发送给上游并逐条产出', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const events = [
      { type: 'guest_start', guest: 'charlie-munger' },
      { type: 'delta', guest: 'charlie-munger', text: 'hello' },
      { type: 'delta', guest: 'charlie-munger', text: '中文' },
      { type: 'guest_end', guest: 'charlie-munger' },
      { type: 'done' },
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: eventBody(sse(...events)),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    const history = [
      { role: 'user' as const, content: ' 帮我看运势  ' },
      { role: 'assistant' as const, content: '老夫观你印堂发亮', guest: 'charlie-munger' as const },
      { role: 'user' as const, content: ' 然后呢  ' },
    ]
    const result = await streamChat(history, 'fp-1', [...soloGuest])
    expect(result).not.toHaveProperty('error')

    const chunks: string[] = []
    if (!('error' in result)) {
      for await (const chunk of result) chunks.push(chunk)
    }
    expect(chunks).toEqual(events.map((event) => `${JSON.stringify(event)}\n`))
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:9000/api/v1/chat/stream',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'user', content: '帮我看运势' },
            { role: 'assistant', content: '老夫观你印堂发亮', guest: 'charlie-munger' },
            { role: 'user', content: '然后呢' },
          ],
          guests: ['charlie-munger'],
        }),
      }),
    )
  })

  it('会按指纹执行内存中的小时频率限制', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"done"}\n'))
            controller.close()
          },
        }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    for (let index = 0; index < 30; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-1', [...soloGuest])
      expect(result).not.toHaveProperty('error')
      await drain(result)
    }

    await expect(streamChat(userMessage('blocked'), 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'RATE_LIMIT',
    })
  })

  it('会按 IP 执行内存中的小时频率限制', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"done"}\n'))
            controller.close()
          },
        }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    for (let index = 0; index < 30; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-ip', [...soloGuest], '1.2.3.4')
      expect(result).not.toHaveProperty('error')
      await drain(result)
    }

    await expect(streamChat(userMessage('blocked'), 'fp-ip', [...soloGuest], '1.2.3.4')).resolves.toEqual({
      error: 'RATE_LIMIT',
    })
  })

  it('会按指纹执行每日 100 点额度上限', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"done"}\n'))
            controller.close()
          },
        }),
      }),
    )
    const { chatStreamTestUtils, streamChat } = await import('@/src/features/chat/services')
    chatStreamTestUtils.setDailyLimitForTest(3)

    for (let index = 0; index < 3; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-1', [...soloGuest])
      expect(result).not.toHaveProperty('error')
      await drain(result)
    }

    await expect(streamChat(userMessage('blocked'), 'fp-1', [...soloGuest])).resolves.toEqual({
      error: 'DAILY_LIMIT',
    })
  })

  it('会按 IP 执行每日 100 点额度上限', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"done"}\n'))
            controller.close()
          },
        }),
      }),
    )
    const { chatStreamTestUtils, streamChat } = await import('@/src/features/chat/services')
    chatStreamTestUtils.setDailyLimitForTest(3)

    for (let index = 0; index < 3; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-ip-2', [...soloGuest], '2.3.4.5')
      expect(result).not.toHaveProperty('error')
      await drain(result)
    }

    await expect(streamChat(userMessage('blocked'), 'fp-ip-2', [...soloGuest], '2.3.4.5')).resolves.toEqual({
      error: 'DAILY_LIMIT',
    })
  })

  it('会透传上游的服务每日总量限制', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'SERVICE_DAILY_LIMIT' }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1', [...soloGuest], '3.4.5.6')).resolves.toEqual({
      error: 'SERVICE_DAILY_LIMIT',
    })
  })

  it('会按宾客数扣每日额度', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"done"}\n'))
            controller.close()
          },
        }),
      }),
    )
    const { chatStreamTestUtils, streamChat } = await import('@/src/features/chat/services')
    chatStreamTestUtils.setDailyLimitForTest(3)

    const group = ['charlie-munger', 'steve-jobs', 'richard-feynman'] as const
    const result = await streamChat(userMessage('圆桌'), 'fp-group', [...group], '6.7.8.9')
    expect(result).not.toHaveProperty('error')
    await drain(result)

    await expect(streamChat(userMessage('单聊'), 'fp-group', [...soloGuest], '6.7.8.9')).resolves.toEqual({
      error: 'DAILY_LIMIT',
    })
  })

  it('同一指纹同时只能有一条流', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null
    const pendingBody = new ReadableStream<Uint8Array>({
      start(streamController) {
        controller = streamController
      },
    })
    const closedBody = new ReadableStream<Uint8Array>({
      start(streamController) {
        streamController.enqueue(encoder.encode('data: {"type":"done"}\n'))
        streamController.close()
      },
    })
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, body: pendingBody })
        .mockResolvedValueOnce({ ok: true, body: closedBody }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    const first = await streamChat(userMessage('第一条'), 'fp-busy', [...soloGuest], '7.8.9.10')
    expect(first).not.toHaveProperty('error')

    await expect(streamChat(userMessage('第二条'), 'fp-busy', [...soloGuest], '7.8.9.10')).resolves.toEqual({
      error: 'BUSY',
    })

    controller!.enqueue(encoder.encode('data: {"type":"done"}\n'))
    controller!.close()
    await drain(first)

    const third = await streamChat(userMessage('第三条'), 'fp-busy', [...soloGuest], '7.8.9.10')
    expect(third).not.toHaveProperty('error')
    await drain(third)
  })

  it('会透传上游的服务繁忙限制', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'SERVICE_BUSY' }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1', [...soloGuest], '8.9.10.11')).resolves.toEqual({
      error: 'SERVICE_BUSY',
    })
  })
})
