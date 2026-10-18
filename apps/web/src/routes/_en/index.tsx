import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts, HomePage } from '@/src/features/home'

export const Route = createFileRoute('/_en/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [
      { title: 'Max Zhang — AI Product Manager' },
      {
        name: 'description',
        content:
          'Ten years of full-stack engineering; two years shipping multi-agent systems. Building AI products, and writing code to test the judgment.',
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
