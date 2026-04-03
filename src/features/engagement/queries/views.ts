import { prisma } from '@/src/server/db'

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
