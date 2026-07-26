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

describe('流式聊天服务', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    const { chatStreamTestUtils } = await import('@/src/features/chat/services')
    chatStreamTestUtils.resetRateLimitState()
  })

  it('会在访问数据库前拒绝缺失的指纹', async () => {
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat('hello', '')).resolves.toEqual({
      error: 'INVALID_FINGERPRINT',
    })
    expect(findFirstMock).not.toHaveBeenCalled()
  })

  it('会拒绝无效指纹', async () => {
    findFirstMock.mockResolvedValue(null)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat('hello', 'fp-1')).resolves.toEqual({
      error: 'INVALID_FINGERPRINT',
    })
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { fingerprint: 'fp-1' },
    })
  })

  it('会在调用上游前拒绝无效消息', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat('', 'fp-1')).resolves.toEqual({
      error: 'INVALID_MESSAGE',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('会拒绝超长消息', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat('a'.repeat(2001), 'fp-1')).resolves.toEqual({
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

    await expect(streamChat('hello', 'fp-1')).resolves.toEqual({
      error: 'UPSTREAM_ERROR',
    })
  })

  it('会将去除空白后的消息发送给上游并在成功时返回响应体', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    const body = new ReadableStream()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body,
    })
    vi.stubGlobal('fetch', fetchMock)
    const { streamChat } = await import('@/src/features/chat/services')

    await expect(streamChat('  hello  ', 'fp-1')).resolves.toBe(body)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://host.docker.internal:8000/api/v1/chat/stream',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'hello' }),
      }),
    )
  })

  it('会按指纹执行内存中的频率限制', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      }),
    )
    const { streamChat } = await import('@/src/features/chat/services')

    for (let index = 0; index < 50; index += 1) {
      await expect(streamChat(`hello-${index}`, 'fp-1')).resolves.toBeInstanceOf(ReadableStream)
    }

    await expect(streamChat('blocked', 'fp-1')).resolves.toEqual({
      error: 'RATE_LIMIT',
    })
  })
})
