'use server'

import { prisma } from '@/lib/prisma'
import { escapeHtml } from '@/lib/utils'

const MAX_COMMENT_LENGTH = 1000
const MAX_COMMENTS_PER_DAY = 5

/**
 * 获取文章的评论数量
 * @param slug - 文章 slug
 * @returns 评论数量
 */
export async function getCommentCount(slug: string): Promise<number> {
  const count = await prisma.comment.count({
    where: { slug },
  })
  return count
}

/**
 * 添加评论或回复
 * @param slug - 文章 slug
 * @param content - 评论内容
 * @param fingerprint - 浏览器指纹
 * @param parentId - 回复的评论 ID（可选，null 或不传表示顶层评论）
 * @returns 包含成功状态、错误信息和剩余评论次数的对象
 */
export async function addComment(
  slug: string,
  content: string,
  fingerprint: string,
  parentId?: number,
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  if (!fingerprint) {
    return { success: false, error: 'Invalid fingerprint' }
  }

  // 验证内容长度
  const trimmedContent = content.trim()
  if (trimmedContent.length === 0) {
    return { success: false, error: 'Comment cannot be empty' }
  }
  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    return { success: false, error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` }
  }

  // 验证 parentId：如果传了 parentId，必须是同一个 slug 下的已存在评论
  if (parentId !== undefined) {
    const parentComment = await prisma.comment.findFirst({
      where: { id: parentId, slug },
    })
    if (!parentComment) {
      return { success: false, error: 'Parent comment not found' }
    }
  }

  // XSS 防护 - 转义 HTML 实体
  const safeContent = escapeHtml(trimmedContent)

  // 检查 24 小时限制（回复共享顶层评论的限制）
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

  // 在事务中创建评论并记录日志
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

  const remaining = MAX_COMMENTS_PER_DAY - commentCount - 1
  return { success: true, remaining }
}

/**
 * 获取用户今日剩余评论次数
 * @param slug - 文章 slug
 * @param fingerprint - 浏览器指纹
 * @returns 剩余评论次数
 */
export async function getRemainingComments(slug: string, fingerprint: string): Promise<number> {
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

/**
 * 获取文章的评论列表（嵌套结构，支持无限层级）
 * @param slug - 文章 slug
 * @returns 顶层评论列表，每条包含 replies 数组（递归嵌套）
 */
export async function getComments(slug: string): Promise<CommentWithReplies[]> {
  // 查出所有评论，不依赖 Prisma 的 include 层级限制
  const flatComments = await prisma.comment.findMany({
    where: { slug },
    orderBy: { createdAt: 'asc' },
  })

  // 在内存中构建树形结构，支持无限层级
  const map = new Map<number, CommentWithReplies>()

  // 先把所有评论转成 CommentWithReplies（带空 replies 数组）存入 Map
  for (const c of flatComments) {
    map.set(c.id, { ...c, replies: [] })
  }

  // 再遍历一次，把每条评论挂到父评论的 replies 下
  const roots: CommentWithReplies[] = []
  for (const c of flatComments) {
    const node = map.get(c.id)!
    if (c.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(c.parentId)
      if (parent) {
        parent.replies.push(node)
      }
    }
  }

  return roots
}

export interface Comment {
  id: number
  slug: string
  fingerprint: string
  content: string
  createdAt: Date
  parentId: number | null
}

export interface CommentWithReplies extends Comment {
  replies: Comment[]
}

/**
 * 批量获取多篇文章的评论数
 * @param slugs - 文章 slug 数组
 * @returns Record<slug, count> 格式的评论数映射
 */
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
    {} as Record<string, number>,
  )
}
