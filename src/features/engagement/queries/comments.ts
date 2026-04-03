import type { CommentWithReplies } from '@/src/features/engagement/model'
import { prisma } from '@/src/server/db'

export function buildCommentTree(flatComments: Array<Omit<CommentWithReplies, 'replies'>>): CommentWithReplies[] {
  const map = new Map<number, CommentWithReplies>()

  for (const comment of flatComments) {
    map.set(comment.id, { ...comment, replies: [] })
  }

  const roots: CommentWithReplies[] = []
  for (const comment of flatComments) {
    const node = map.get(comment.id)
    if (!node) continue

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

export async function getCommentCount(slug: string): Promise<number> {
  return prisma.comment.count({
    where: { slug },
  })
}

export async function getComments(slug: string): Promise<CommentWithReplies[]> {
  const flatComments = await prisma.comment.findMany({
    where: { slug },
    orderBy: { createdAt: 'asc' },
  })

  return buildCommentTree(flatComments)
}

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
