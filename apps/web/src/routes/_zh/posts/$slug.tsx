import { createFileRoute, notFound } from '@tanstack/react-router'
import { loadPostPageFn, PostPage } from '@/src/features/posts'
import { NotFoundPage } from '@/src/shared/components'

export const Route = createFileRoute('/_zh/posts/$slug')({
  loader: async ({ params, context }) => {
    try {
      return await loadPostPageFn({ data: { slug: params.slug, locale: context.locale } })
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
  notFoundComponent: NotFoundPage,
})

function PostComponent() {
  const { post, commentCount } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  return <PostPage post={post} commentCount={commentCount} locale={locale} />
}
