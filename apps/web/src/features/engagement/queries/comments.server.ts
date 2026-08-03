import type { CommentWithReplies } from '@/src/features/engagement/model'
import { prisma } from '@/src/server/db'

/**
 * 评论查询模块
 *
 * 负责评论树构建、评论数量统计，以及评论配额剩余量查询。
 */

/**
 * 将数据库返回的扁平评论列表转换成父子嵌套结构。
 */
export function buildCommentTree(flatComments: Array<Omit<CommentWithReplies, 'replies'>>): CommentWithReplies[] {
  const map = new Map<number, CommentWithReplies>()

  // 先创建所有节点，便于第二轮按 parentId 回填父子关系。
  for (const comment of flatComments) {
    map.set(comment.id, { ...comment, replies: [] })
  }

  const roots: CommentWithReplies[] = []
  for (const comment of flatComments) {
    const node = map.get(comment.id)
    if (!node) continue

    // 顶层评论直接进入根数组，回复则挂到父评论下。
    if (comment.parentId === null) {
      roots.push(node)
      continue
    }

    const parent = map.get(comment.parentId)
    if (parent) {
      parent.replies.push(node)
    }
  }

  return roots
}

/**
 * 获取单篇文章的评论总数。
 */
export async function getCommentCount(slug: string): Promise<number> {
  return prisma.comment.count({
    where: { slug },
  })
}

/**
 * 获取单篇文章的评论树，按创建时间升序输出。
 */
export async function getComments(slug: string): Promise<CommentWithReplies[]> {
  const flatComments = await prisma.comment.findMany({
    where: { slug },
    orderBy: { createdAt: 'asc' },
  })

  return buildCommentTree(flatComments)
}

/**
 * 批量获取多篇文章的评论数，用于列表页聚合展示。
 */
export async function getCommentCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {}

  const comments = await prisma.comment.groupBy({
    by: ['slug'],
    _count: { id: true },
    where: { slug: { in: slugs } },
  })

  return comments.reduce<Record<string, number>>((accumulator, comment) => {
    accumulator[comment.slug] = comment._count.id
    return accumulator
  }, {})
}

/**
 * 统计当前指纹在最近 24 小时内，对同一文章还能再提交多少条评论。
 */
export async function getRemainingComments(slug: string, fingerprint: string, limit: number): Promise<number> {
  if (!fingerprint) return limit

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const commentCount = await prisma.commentLog.count({
    where: {
      fingerprint,
      slug,
      createdAt: {
        gte: twentyFourHoursAgo,
      },
    },
  })

  return Math.max(0, limit - commentCount)
}
