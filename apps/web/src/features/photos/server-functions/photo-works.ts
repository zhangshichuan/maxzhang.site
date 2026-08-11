import { createServerFn } from '@tanstack/react-start'
import type { Locale } from '@/i18n/routing'
import { getPhotoWork, listPhotoWorks } from '@/src/features/photos/queries/photo-works.server'

export const listPhotoWorksFn = createServerFn({ method: 'GET' })
  .validator((data: { locale: Locale }) => data)
  .handler(async ({ data }) => listPhotoWorks(data.locale))

export const getPhotoWorkFn = createServerFn({ method: 'GET' })
  .validator((data: { slug: string; locale: Locale }) => data)
  .handler(async ({ data }) => getPhotoWork(data.slug, data.locale))
