import { getRemainingComments } from '@/src/features/engagement/queries'
import { engagementRules, validateCommentInput } from '@/src/features/engagement/services/comment-validation'
import { escapeHtml } from '@/src/shared/utils'
import { prisma } from '@/src/server/db'

/**
 * 评论写入服务
 *
 * 负责评论提交前的校验、父评论校验、内容转义、
 * 配额检查，以及评论与评论日志的原子写入。
 */
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

  // 回复评论时，需要确保父评论属于同一篇文章，避免跨文章串联。
  if (parentId !== undefined) {
    const parentComment = await prisma.comment.findFirst({
      where: { id: parentId, slug },
    })
    if (!parentComment) {
      return { success: false, error: 'Parent comment not found' }
    }
  }

  // 入库前先转义 HTML，避免评论内容被当成可执行标记渲染。
  const safeContent = escapeHtml(validation.trimmedContent)
  const remainingBeforeSubmit = await getRemainingComments(slug, fingerprint, engagementRules.maxCommentsPerDay)

  if (remainingBeforeSubmit <= 0) {
    return {
      success: false,
      error: 'You have reached the maximum of 5 comments per 24 hours. Please try again later.',
    }
  }

  // 评论表与评论日志表一起提交，保证内容和配额统计记录保持一致。
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
