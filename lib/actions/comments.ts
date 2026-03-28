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
 * 添加评论
 * @param slug - 文章 slug
 * @param content - 评论内容
 * @param fingerprint - 浏览器指纹
 * @returns 包含成功状态、错误信息和剩余评论次数的对象
 */
export async function addComment(
	slug: string,
	content: string,
	fingerprint: string,
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

	// XSS 防护 - 转义 HTML 实体
	const safeContent = escapeHtml(trimmedContent)

	// 检查 24 小时限制
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
 * 获取文章的评论列表
 * @param slug - 文章 slug
 * @returns 评论列表，按时间倒序排列
 */
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
