import { getCommentCounts } from '@/src/features/engagement/queries'
import type { Locale } from '@/i18n/routing'
import { prisma } from '@/src/server/db'
import type { PhotoWorkDetail, PhotoWorkSummary } from '@/src/features/photos/model'

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function captionOf(work: { captionZh: string; captionEn: string }, locale: Locale): string {
  return locale === 'zh' ? work.captionZh || work.captionEn : work.captionEn || work.captionZh
}

/**
 * 作品列表：按拍摄时间倒序，封面取 coverIndex 对应的照片。
 */
export async function listPhotoWorks(locale: Locale): Promise<PhotoWorkSummary[]> {
  const works = await prisma.photoWork.findMany({
    include: { photos: { orderBy: { sortIndex: 'asc' } } },
    orderBy: { takenAt: 'desc' },
  })
  const slugs = works.map((work) => work.slug)
  const commentCounts = await getCommentCounts(slugs)

  return works.map((work) => {
    const cover = work.photos[work.coverIndex] ?? work.photos[0]
    return {
      slug: work.slug,
      caption: captionOf(work, locale),
      takenAt: work.takenAt.toISOString(),
      location: work.location,
      tags: parseTags(work.tags),
      photoCount: work.photos.length,
      coverUrl: cover?.largeUrl ?? '',
      thumbUrl: cover?.thumbUrl ?? '',
      commentCount: commentCounts[work.slug] ?? 0,
    }
  })
}

/**
 * 单条作品详情，含每张照片的展示副本与拍摄参数。
 */
export async function getPhotoWork(slug: string, locale: Locale): Promise<PhotoWorkDetail | null> {
  const work = await prisma.photoWork.findUnique({
    where: { slug },
    include: { photos: { orderBy: { sortIndex: 'asc' } } },
  })
  if (!work) return null

  const commentCounts = await getCommentCounts([work.slug])
  const cover = work.photos[work.coverIndex] ?? work.photos[0]
  return {
    slug: work.slug,
    caption: captionOf(work, locale),
    takenAt: work.takenAt.toISOString(),
    location: work.location,
    tags: parseTags(work.tags),
    photoCount: work.photos.length,
    coverUrl: cover?.largeUrl ?? '',
    thumbUrl: cover?.thumbUrl ?? '',
    commentCount: commentCounts[work.slug] ?? 0,
    photos: work.photos.map((photo) => ({
      largeUrl: photo.largeUrl,
      thumbUrl: photo.thumbUrl,
      width: photo.width,
      height: photo.height,
      camera: photo.camera,
      lens: photo.lens,
      focal: photo.focal,
      aperture: photo.aperture,
      shutter: photo.shutter,
      iso: photo.iso,
    })),
  }
}
