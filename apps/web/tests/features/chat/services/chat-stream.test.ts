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

describe('流式聊天服务', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    const { chatStreamTestUtils } = await import('@/src/features/chat/services')
    chatStreamTestUtils.resetRateLimitState()
    chatStreamTestUtils.setDailyLimitForTest(100)
  })

  it('会在访问数据库前拒绝缺失的指纹', async () => {
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), '')).resolves.toEqual({
      error: 'INVALID_FINGERPRINT',
    })
    expect(findFirstMock).not.toHaveBeenCalled()
  })

  it('会拒绝无效指纹', async () => {
    findFirstMock.mockResolvedValue(null)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('hello'), 'fp-1')).resolves.toEqual({
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

    await expect(streamChat([], 'fp-1')).resolves.toEqual({
      error: 'INVALID_MESSAGE',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会拒绝非法角色', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat([{ role: 'system', content: 'hi' }] as never, 'fp-1')).resolves.toEqual({
      error: 'INVALID_MESSAGE',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会拒绝超长用户消息', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat(userMessage('a'.repeat(2001)), 'fp-1')).resolves.toEqual({
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

    await expect(streamChat(userMessage('hello'), 'fp-1')).resolves.toEqual({
      error: 'UPSTREAM_ERROR',
    })
  })

  it('会将完整历史发送给上游并流式产出 SSE 内容块', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: hello\ndata: world\n\ndata: 中文\n'))
        controller.close()
      },
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body,
    })
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    const history = [
      { role: 'user' as const, content: ' 帮我看运势  ' },
      { role: 'assistant' as const, content: '老夫观你印堂发亮' },
      { role: 'user' as const, content: ' 然后呢  ' },
    ]
    const result = await streamChat(history, 'fp-1')
    expect(result).not.toHaveProperty('error')

    const chunks: string[] = []
    if (!('error' in result)) {
      for await (const chunk of result) chunks.push(chunk)
    }
    expect(chunks).toEqual(['hello', 'world', '中文'])
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:9000/api/v1/chat/stream',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'user', content: '帮我看运势' },
            { role: 'assistant', content: '老夫观你印堂发亮' },
            { role: 'user', content: '然后呢' },
          ],
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
            controller.enqueue(encoder.encode('data: ok\n'))
            controller.close()
          },
        }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    for (let index = 0; index < 50; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-1')
      expect(result).not.toHaveProperty('error')
    }

    await expect(streamChat(userMessage('blocked'), 'fp-1')).resolves.toEqual({
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
            controller.enqueue(encoder.encode('data: ok\n'))
            controller.close()
          },
        }),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    for (let index = 0; index < 50; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-ip', '1.2.3.4')
      expect(result).not.toHaveProperty('error')
    }

    await expect(streamChat(userMessage('blocked'), 'fp-ip', '1.2.3.4')).resolves.toEqual({
      error: 'RATE_LIMIT',
    })
  })

  it('会按指纹执行每日 100 轮上限', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: ok\n'))
            controller.close()
          },
        }),
      }),
    )
    const { chatStreamTestUtils, streamChat } = await import('@/src/features/chat/services')
    chatStreamTestUtils.setDailyLimitForTest(3)

    for (let index = 0; index < 3; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-1')
      expect(result).not.toHaveProperty('error')
    }

    await expect(streamChat(userMessage('blocked'), 'fp-1')).resolves.toEqual({
      error: 'DAILY_LIMIT',
    })
  })

  it('会按 IP 执行每日 100 轮上限', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: ok\n'))
            controller.close()
          },
        }),
      }),
    )
    const { chatStreamTestUtils, streamChat } = await import('@/src/features/chat/services')
    chatStreamTestUtils.setDailyLimitForTest(3)

    for (let index = 0; index < 3; index += 1) {
      const result = await streamChat(userMessage(`hello-${index}`), 'fp-ip-2', '2.3.4.5')
      expect(result).not.toHaveProperty('error')
    }

    await expect(streamChat(userMessage('blocked'), 'fp-ip-2', '2.3.4.5')).resolves.toEqual({
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

    await expect(streamChat(userMessage('hello'), 'fp-1', '3.4.5.6')).resolves.toEqual({
      error: 'SERVICE_DAILY_LIMIT',
    })
  })
})
