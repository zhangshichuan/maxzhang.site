'use server'

import { prisma } from '@/lib/prisma'
import { escapeHtml } from '@/lib/utils'

const MAX_COMMENT_LENGTH = 1000
const MAX_COMMENTS_PER_DAY = 5

export async function getCommentCount(slug: string): Promise<number> {
  const count = await prisma.comment.count({
    where: { slug },
  })
  return count
}

export async function addComment(
  slug: string,
  content: string,
  fingerprint: string
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  if (!fingerprint) {
    return { success: false, error: 'Invalid fingerprint' }
  }

  // Validate content length
  const trimmedContent = content.trim()
  if (trimmedContent.length === 0) {
    return { success: false, error: 'Comment cannot be empty' }
  }
  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    return { success: false, error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` }
  }

  // XSS protection - escape HTML entities
  const safeContent = escapeHtml(trimmedContent)

  // Check 24-hour limit
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

  if (commentCount >= MAX_COMMENTS_PER_DAY) {
    return {
      success: false,
      error: 'You have reached the maximum of 5 comments per 24 hours. Please try again later.',
    }
  }

  // Create comment and log in transaction
  await prisma.$transaction([
    prisma.comment.create({
      data: {
        slug,
        fingerprint,
        content: safeContent,
      },
    }),
    prisma.commentLog.create({
      data: {
        fingerprint,
        slug,
      },
    }),
  ])

  const remaining = MAX_COMMENTS_PER_DAY - commentCount - 1
  return { success: true, remaining }
}

export async function getRemainingComments(
  slug: string,
  fingerprint: string
): Promise<number> {
  if (!fingerprint) return MAX_COMMENTS_PER_DAY

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

  return Math.max(0, MAX_COMMENTS_PER_DAY - commentCount)
}

export async function getComments(slug: string): Promise<Comment[]> {
  const comments = await prisma.comment.findMany({
    where: { slug },
    orderBy: { createdAt: 'desc' },
  })
  return comments
}

export interface Comment {
  id: number
  slug: string
  fingerprint: string
  content: string
  createdAt: Date
}

export async function getCommentCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {}

  const comments = await prisma.comment.groupBy({
    by: ['slug'],
    _count: { id: true },
    where: { slug: { in: slugs } },
  })

  return comments.reduce(
    (acc, c) => {
      acc[c.slug] = c._count.id
      return acc
    },
    {} as Record<string, number>
  )
}
