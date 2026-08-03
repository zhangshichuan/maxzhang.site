import { createFileRoute, notFound } from '@tanstack/react-router'
import { loadPostPage, PostPage } from '@/src/features/posts'

export const Route = createFileRoute('/en/posts/$slug')({
  loader: async ({ params, context }) => {
    try {
      return await loadPostPage(params.slug, context.locale)
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData!.post.title} - Max Zhang` },
      { name: 'description', content: loaderData!.post.summary },
      { name: 'keywords', content: loaderData!.post.tags.join(', ') },
    ],
  }),
  component: PostComponent,
  notFoundComponent: () => (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: 'rgba(255,255,255,.35)' }}>Post not found</div>
  ),
})

function PostComponent() {
  const { post, commentCount } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  return <PostPage post={post} commentCount={commentCount} locale={locale} />
}
