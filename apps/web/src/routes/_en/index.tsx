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
          'Max Zhang — AI Product Manager with 10+ years of full-stack engineering. A knowledge map, six industry case studies, and my judgment on building AI products.',
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
