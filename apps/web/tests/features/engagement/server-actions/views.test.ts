import { beforeEach, describe, expect, it, vi } from 'vitest'

const incrementViewService = vi.fn()

vi.mock('@/src/features/engagement/services', () => ({
  incrementView: incrementViewService,
}))

describe('阅读数服务端动作', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会将增加阅读数的调用转发到服务层', async () => {
    incrementViewService.mockResolvedValue(10)
    const { incrementView } = await import('@/src/features/engagement/server-actions/views')

    await expect(incrementView('post-1', 'en', 'fp-1')).resolves.toBe(10)
    expect(incrementViewService).toHaveBeenCalledWith('post-1', 'en', 'fp-1')
  })
})
