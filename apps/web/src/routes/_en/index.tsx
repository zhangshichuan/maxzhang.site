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
          'AI product manager. Ten years building products, the last two shipping AI systems. Turning model capability into products people trust.',
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
