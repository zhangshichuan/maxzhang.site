import { prisma } from '@/src/server/db'

/**
 * 阅读量查询模块
 *
 * 提供单篇和批量文章阅读量查询，供详情页和列表页复用。
 */

/**
 * 获取单篇文章在指定语言下的阅读量。
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
 * 批量获取多篇文章的阅读量，返回以 slug 为键的映射表。
 */
export async function getViewCounts(slugs: string[], locale: string): Promise<Record<string, number>> {
  if (slugs.length === 0) return {}

  const postViews = await prisma.postView.findMany({
    where: {
      slug: { in: slugs },
      locale,
    },
  })

  return postViews.reduce<Record<string, number>>((accumulator, postView) => {
    accumulator[postView.slug] = postView.views
    return accumulator
  }, {})
}
