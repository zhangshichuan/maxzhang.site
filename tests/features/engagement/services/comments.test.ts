import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getRemainingCommentsMock, findFirstMock, commentCreateMock, commentLogCreateMock, transactionMock } =
  vi.hoisted(() => ({
    getRemainingCommentsMock: vi.fn(),
    findFirstMock: vi.fn(),
    commentCreateMock: vi.fn(),
    commentLogCreateMock: vi.fn(),
    transactionMock: vi.fn(),
  }))

vi.mock('@/src/features/engagement/queries', () => ({
  getRemainingComments: getRemainingCommentsMock,
}))

vi.mock('@/src/server/db', () => ({
  prisma: {
    comment: {
      findFirst: findFirstMock,
      create: commentCreateMock,
    },
    commentLog: {
      create: commentLogCreateMock,
    },
    $transaction: transactionMock,
  },
}))

import { addComment, engagementRules, validateCommentInput } from '@/src/features/engagement/services'

describe('评论服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会拒绝缺失指纹的输入', () => {
    expect(validateCommentInput('hello', '')).toEqual({
      ok: false,
      error: 'Invalid fingerprint',
    })
  })

  it('会拒绝去除空白后为空的评论', () => {
    expect(validateCommentInput('   ', 'fp-1')).toEqual({
      ok: false,
      error: 'Comment cannot be empty',
    })
  })

  it('会拒绝超过配置长度上限的评论', () => {
    const result = validateCommentInput('a'.repeat(engagementRules.maxCommentLength + 1), 'fp-1')

    expect(result).toEqual({
      ok: false,
      error: `Comment cannot exceed ${engagementRules.maxCommentLength} characters`,
    })
  })

  it('会为合法评论返回去除空白后的内容', () => {
    expect(validateCommentInput('  hello world  ', 'fp-1')).toEqual({
      ok: true,
      trimmedContent: 'hello world',
    })
  })

  it('会在父评论不存在于同一 slug 下时拒绝回复', async () => {
    findFirstMock.mockResolvedValue(null)

    await expect(addComment('post-1', 'hello', 'fp-1', 42)).resolves.toEqual({
      success: false,
      error: 'Parent comment not found',
    })

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: 42, slug: 'post-1' },
    })
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it('会在每日额度耗尽后拒绝评论', async () => {
    getRemainingCommentsMock.mockResolvedValue(0)

    await expect(addComment('post-1', 'hello', 'fp-1')).resolves.toEqual({
      success: false,
      error: 'You have reached the maximum of 5 comments per 24 hours. Please try again later.',
    })

    expect(getRemainingCommentsMock).toHaveBeenCalledWith('post-1', 'fp-1', engagementRules.maxCommentsPerDay)
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it('会在事务中写入转义后的评论和日志记录', async () => {
    commentCreateMock.mockReturnValue('comment-create-op')
    commentLogCreateMock.mockReturnValue('comment-log-op')
    getRemainingCommentsMock.mockResolvedValue(3)

    await expect(addComment('post-1', ' <b>Hello</b> ', 'fp-1')).resolves.toEqual({
      success: true,
      remaining: 2,
    })

    expect(commentCreateMock).toHaveBeenCalledWith({
      data: {
        slug: 'post-1',
        fingerprint: 'fp-1',
        content: '&lt;b&gt;Hello&lt;/b&gt;',
        parentId: null,
      },
    })
    expect(commentLogCreateMock).toHaveBeenCalledWith({
      data: {
        fingerprint: 'fp-1',
        slug: 'post-1',
      },
    })
    expect(transactionMock).toHaveBeenCalledWith(['comment-create-op', 'comment-log-op'])
  })
})
