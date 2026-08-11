import { createFileRoute } from '@tanstack/react-router'
import { PhotosIndex } from '@/src/features/photos'
import { listPhotoWorksFn } from '@/src/features/photos/server-functions'

export const Route = createFileRoute('/zh/photos/')({
  loader: ({ context }) => listPhotoWorksFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [{ title: '摄影 - Max Zhang' }, { name: 'description', content: '精选摄影作品。' }],
  }),
  component: PhotosIndexComponent,
})

function PhotosIndexComponent() {
  const works = Route.useLoaderData()
  return <PhotosIndex works={works} />
}
