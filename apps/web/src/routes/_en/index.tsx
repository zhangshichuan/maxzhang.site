import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts, HomePage } from '@/src/features/home'

export const Route = createFileRoute('/_en/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [
      { title: 'Max Zhang · AI Product Manager | Knowledge Map & Case Studies' },
      {
        name: 'description',
        content:
          'Max Zhang — a full-stack engineer moving into AI product. A 13-week course rebuilt into a knowledge map, six industry case reviews, and my judgment on shipping AI products.',
      },
    ],
  }),
  component: HomeComponent,
})

function HomeComponent() {
  const posts = Route.useLoaderData()
  return (
    <>
      <FingerprintRegistrar />
      <HomePage posts={posts} />
    </>
  )
}
