import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts } from '@/src/features/home'
import { HomePage } from '@/src/features/home'

export const Route = createFileRoute('/zh/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [
      { title: 'Max Zhang · AI 产品经理' },
      {
        name: 'description',
        content: 'Max Zhang，AI 产品经理。前全栈工程师，关注 Agent、RAG、模型评估与 AI 产品落地。',
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
