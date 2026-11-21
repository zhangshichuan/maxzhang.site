import { createFileRoute } from '@tanstack/react-router'
import { FingerprintRegistrar } from '@/src/features/engagement'
import { getFeaturedPosts } from '@/src/features/home'
import { NightHome } from '@/src/features/home'

export const Route = createFileRoute('/zh/')({
  loader: ({ context }) => getFeaturedPosts(context.locale),
  head: () => ({
    meta: [
      { title: 'Max Zhang — Product-minded AI builder' },
      {
        name: 'description',
        content: '常驻成都的 Product-minded AI builder。十年产品构建经验，最近两年把 AI 系统从零带到生产。',
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
      <NightHome posts={posts} />
    </>
  )
}
