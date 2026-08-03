import { createFileRoute } from '@tanstack/react-router'
import { getFeaturedPosts } from '@/src/features/home'
import { HomePage } from '@/src/features/home'

export const Route = createFileRoute('/_zh/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [{ title: 'Max Zhang' }, { name: 'description', content: 'Personal website of Max Zhang' }],
  }),
  component: HomeComponent,
})

function HomeComponent() {
  const posts = Route.useLoaderData()
  return <HomePage posts={posts} />
}
