import { beforeEach, describe, expect, it, vi } from 'vitest'

const getCommentCountQuery = vi.fn()
const getCommentsQuery = vi.fn()
const getRemainingCommentsQuery = vi.fn()
const addCommentService = vi.fn()

vi.mock('@/src/features/engagement/queries', () => ({
  getCommentCount: getCommentCountQuery,
  getComments: getCommentsQuery,
  getRemainingComments: getRemainingCommentsQuery,
}))

vi.mock('@/src/features/engagement/services', () => ({
  addComment: addCommentService,
  engagementRules: {
    maxCommentsPerDay: 5,
  },
}))

describe('评论服务端动作', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会将获取评论数的调用转发到查询层', async () => {
    getCommentCountQuery.mockResolvedValue(7)
    const { getCommentCount } = await import('@/src/features/engagement/server-actions')

    await expect(getCommentCount('post-1')).resolves.toBe(7)
    expect(getCommentCountQuery).toHaveBeenCalledWith('post-1')
  })

  it('会在查询剩余评论次数时带上配置的每日限制', async () => {
    getRemainingCommentsQuery.mockResolvedValue(2)
    const { getRemainingComments } = await import('@/src/features/engagement/server-actions')

    await expect(getRemainingComments('post-1', 'fp-1')).resolves.toBe(2)
    expect(getRemainingCommentsQuery).toHaveBeenCalledWith('post-1', 'fp-1', 5)
  })

  it('会将新增评论的调用转发到服务层', async () => {
    addCommentService.mockResolvedValue({ success: true, remaining: 4 })
    const { addComment } = await import('@/src/features/engagement/server-actions')

    await expect(addComment('post-1', 'hello', 'fp-1', 9)).resolves.toEqual({
      success: true,
      remaining: 4,
    })
    expect(addCommentService).toHaveBeenCalledWith('post-1', 'hello', 'fp-1', 9)
  })
})
