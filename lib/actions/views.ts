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
