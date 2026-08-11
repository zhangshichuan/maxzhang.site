import { createFileRoute } from '@tanstack/react-router'
import { loadPostsIndexFn, PostsClient } from '@/src/features/posts'

export const Route = createFileRoute('/_en/posts/')({
  loader: ({ context }) => loadPostsIndexFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [{ title: 'Articles - Max Zhang' }, { name: 'description', content: 'Code, design, and everyday life.' }],
  }),
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  const data = Route.useLoaderData()
  return <PostsClient posts={data.posts} allTags={data.allTags} allCategories={data.allCategories} />
}
