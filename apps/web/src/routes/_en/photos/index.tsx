import { createFileRoute } from '@tanstack/react-router'
import { PhotosIndex } from '@/src/features/photos'
import { listPhotoWorksFn } from '@/src/features/photos/server-functions'

export const Route = createFileRoute('/_en/photos/')({
  loader: ({ context }) => listPhotoWorksFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [
      { title: 'Photography - Max Zhang' },
      { name: 'description', content: 'A curated collection of photographs.' },
    ],
  }),
  component: PhotosIndexComponent,
})

function PhotosIndexComponent() {
  const works = Route.useLoaderData()
  return <PhotosIndex works={works} />
}
