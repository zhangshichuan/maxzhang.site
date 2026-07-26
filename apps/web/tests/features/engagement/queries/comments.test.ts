import { describe, expect, it } from 'vitest'

import { buildCommentTree } from '@/src/features/engagement/queries'

describe('评论树构建', () => {
  it('会递归地将回复挂到对应父评论下', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    const tree = buildCommentTree([
      { id: 1, slug: 'post', fingerprint: 'root', content: 'root', createdAt, parentId: null },
      { id: 2, slug: 'post', fingerprint: 'child', content: 'child', createdAt, parentId: 1 },
      { id: 3, slug: 'post', fingerprint: 'leaf', content: 'leaf', createdAt, parentId: 2 },
    ])

    expect(tree).toHaveLength(1)
    expect(tree[0].replies).toHaveLength(1)
    expect(tree[0].replies[0].id).toBe(2)
    expect(tree[0].replies[0].replies[0].id).toBe(3)
  })

  it('会忽略找不到父评论的孤儿回复', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    const tree = buildCommentTree([
      { id: 1, slug: 'post', fingerprint: 'root', content: 'root', createdAt, parentId: null },
      { id: 2, slug: 'post', fingerprint: 'orphan', content: 'orphan', createdAt, parentId: 999 },
    ])

    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].replies).toHaveLength(0)
  })
})
