import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts } from '@/src/features/home'
import { HomePage } from '@/src/features/home'

export const Route = createFileRoute('/zh/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [
      { title: 'Max Zhang · AI 产品经理｜13 周知识地图与实战案例' },
      {
        name: 'description',
        content:
          'Max Zhang，十年全栈工程师转 AI 产品经理。用 13 周课程重构的知识地图、6 个行业案例复盘，以及我对 AI 产品落地的判断。',
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
