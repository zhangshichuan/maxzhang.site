import { getViewCount } from '@/src/features/engagement/queries'
import { prisma } from '@/src/server/db'

export async function incrementView(slug: string, locale: string, fingerprint: string) {
  if (!fingerprint) return null

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

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

  return getViewCount(slug, locale)
}
