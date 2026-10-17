import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts } from '@/src/features/home'
import { HomePage } from '@/src/features/home'

export const Route = createFileRoute('/zh/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [
      { title: 'Max Zhang · AI 产品经理｜知识地图与实战案例' },
      {
        name: 'description',
        content:
          'Max Zhang，10 年以上全栈经验的 AI 产品经理。一份 AI 产品知识地图、六个行业案例复盘，以及我对 AI 产品落地的判断。',
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
