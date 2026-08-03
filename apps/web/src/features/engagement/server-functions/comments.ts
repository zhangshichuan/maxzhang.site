import { createServerFn } from '@tanstack/react-start'
import type { CommentWithReplies } from '@/src/features/engagement/model'
import {
  getCommentCount as getCommentCountQuery,
  getComments as getCommentsQuery,
  getRemainingComments as getRemainingCommentsQuery,
} from '@/src/features/engagement/queries/comments.server'
import { engagementRules } from '@/src/features/engagement/services/comment-validation'
import { addComment as addCommentService } from '@/src/features/engagement/services/comments.server'

/**
 * 评论相关 Server Actions
 *
 * 这一层只负责给客户端暴露稳定的服务端入口，
 * 具体的查询和写入逻辑仍下沉到 queries / services 中。
 * 已迁移为 TanStack Server Function。
 */

export const getCommentCount = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => getCommentCountQuery(data.slug))

export const getComments = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<CommentWithReplies[]> => getCommentsQuery(data.slug))

/**
 * 返回当前用户针对某篇文章剩余的评论配额。
 */
export const getRemainingComments = createServerFn({ method: 'GET' })
  .validator((data: { slug: string; fingerprint: string }) => data)
  .handler(async ({ data }) =>
    getRemainingCommentsQuery(data.slug, data.fingerprint, engagementRules.maxCommentsPerDay),
  )

/**
 * 新增评论或回复。
 */
export const addComment = createServerFn({ method: 'POST' })
  .validator((data: { slug: string; content: string; fingerprint: string; parentId?: number }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string; remaining?: number }> =>
    addCommentService(data.slug, data.content, data.fingerprint, data.parentId),
  )
