import { createFileRoute } from '@tanstack/react-router'
import { loadPostsIndexFn, PostsClient } from '@/src/features/posts'

export const Route = createFileRoute('/zh/posts/')({
  loader: ({ context }) => loadPostsIndexFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [{ title: '文章 - Max Zhang' }, { name: 'description', content: '技术、设计与生活的交汇之地。' }],
  }),
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  const data = Route.useLoaderData()
  return <PostsClient posts={data.posts} allTags={data.allTags} allCategories={data.allCategories} />
}
