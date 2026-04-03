import { beforeEach, describe, expect, it, vi } from 'vitest'

const { streamChatMock } = vi.hoisted(() => ({
  streamChatMock: vi.fn(),
}))

vi.mock('@/src/features/chat/services', () => ({
  streamChat: streamChatMock,
}))

describe('聊天服务端动作', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会将 chatStream 调用转发到服务层', async () => {
    streamChatMock.mockResolvedValue({ error: 'UPSTREAM_ERROR' })
    const { chatStream } = await import('@/src/features/chat/server-actions')

    await expect(chatStream('hello', 'fp-1')).resolves.toEqual({
      error: 'UPSTREAM_ERROR',
    })
    expect(streamChatMock).toHaveBeenCalledWith('hello', 'fp-1')
  })
})
