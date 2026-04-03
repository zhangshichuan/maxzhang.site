'use server'

import { getRemainingComments } from '@/src/features/engagement/queries'
import { engagementRules, validateCommentInput } from '@/src/features/engagement/services/comment-validation'
import { escapeHtml } from '@/src/shared/utils'
import { prisma } from '@/src/server/db'

export async function addComment(
  slug: string,
  content: string,
  fingerprint: string,
  parentId?: number,
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  const validation = validateCommentInput(content, fingerprint)
  if (!validation.ok) {
    return { success: false, error: validation.error }
  }

  if (parentId !== undefined) {
    const parentComment = await prisma.comment.findFirst({
      where: { id: parentId, slug },
    })
    if (!parentComment) {
      return { success: false, error: 'Parent comment not found' }
    }
  }

  const safeContent = escapeHtml(validation.trimmedContent)
  const remainingBeforeSubmit = await getRemainingComments(slug, fingerprint, engagementRules.maxCommentsPerDay)

  if (remainingBeforeSubmit <= 0) {
    return {
      success: false,
      error: 'You have reached the maximum of 5 comments per 24 hours. Please try again later.',
    }
  }

  await prisma.$transaction([
    prisma.comment.create({
      data: {
        slug,
        fingerprint,
        content: safeContent,
        parentId: parentId ?? null,
      },
    }),
    prisma.commentLog.create({
      data: {
        fingerprint,
        slug,
      },
    }),
  ])

  return {
    success: true,
    remaining: remainingBeforeSubmit - 1,
  }
}
