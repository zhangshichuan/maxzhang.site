'use server'

import { prisma } from '@/lib/prisma'

export async function incrementView(slug: string, locale: string, fingerprint: string) {
  if (!fingerprint) return null

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Check if this fingerprint has viewed this article in the last 24 hours
  const existingLog = await prisma.viewLog.findFirst({
    where: {
      fingerprint,
      slug,
      locale,
      createdAt: {
        gte: twentyFourHoursAgo,
      },
    },
  })

  if (!existingLog) {
    // Increment the view count and log the view in a transaction
    await prisma.$transaction([
      prisma.postView.upsert({
        where: {
          slug_locale: {
            slug,
            locale,
          },
        },
        update: {
          views: {
            increment: 1,
          },
        },
        create: {
          slug,
          locale,
          views: 1,
        },
      }),
      prisma.viewLog.create({
        data: {
          fingerprint,
          slug,
          locale,
        },
      }),
    ])
  }

  const postView = await prisma.postView.findUnique({
    where: {
      slug_locale: {
        slug,
        locale,
      },
    },
  })

  return postView?.views || 0
}

/**
 * 获取单篇文章的阅读数
 * @param slug - 文章 slug
 * @param locale - 语言环境
 * @returns 阅读数，未找到则返回 0
 */
export async function getViewCount(slug: string, locale: string) {
  const postView = await prisma.postView.findUnique({
    where: {
      slug_locale: {
        slug,
        locale,
      },
    },
  })

  return postView?.views || 0
}

/**
 * 批量获取多篇文章的阅读数，避免 N+1 查询问题
 * @param slugs - 文章 slug 数组
 * @param locale - 语言环境
 * @returns Record<slug, views> 格式的阅读数映射
 */
export async function getViewCounts(slugs: string[], locale: string): Promise<Record<string, number>> {
  if (slugs.length === 0) return {}

  const postViews = await prisma.postView.findMany({
    where: {
      slug: { in: slugs },
      locale,
    },
  })

  // 转换为 { slug: views } 格式的 Record
  return postViews.reduce(
    (acc, pv) => {
      acc[pv.slug] = pv.views
      return acc
    },
    {} as Record<string, number>
  )
}
