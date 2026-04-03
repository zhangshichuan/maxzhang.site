'use server'

import type { CommentWithReplies } from '@/src/features/engagement/model'
import {
  getCommentCount as getCommentCountQuery,
  getComments as getCommentsQuery,
  getRemainingComments as getRemainingCommentsQuery,
} from '@/src/features/engagement/queries'
import { addComment as addCommentService, engagementRules } from '@/src/features/engagement/services'

export async function getCommentCount(slug: string): Promise<number> {
  return getCommentCountQuery(slug)
}

export async function getComments(slug: string): Promise<CommentWithReplies[]> {
  return getCommentsQuery(slug)
}

export async function getRemainingComments(slug: string, fingerprint: string): Promise<number> {
  return getRemainingCommentsQuery(slug, fingerprint, engagementRules.maxCommentsPerDay)
}

export async function addComment(
  slug: string,
  content: string,
  fingerprint: string,
  parentId?: number,
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  return addCommentService(slug, content, fingerprint, parentId)
}
