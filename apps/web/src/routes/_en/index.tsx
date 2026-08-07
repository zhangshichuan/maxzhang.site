import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts, HomePage } from '@/src/features/home'

export const Route = createFileRoute('/_en/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [{ title: 'Max Zhang' }, { name: 'description', content: 'Personal website of Max Zhang' }],
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
