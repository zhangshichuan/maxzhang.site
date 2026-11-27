import { createFileRoute } from '@tanstack/react-router'
import { loadPostsIndexFn, PostsClient } from '@/src/features/posts'

export const Route = createFileRoute('/_en/posts/')({
  loader: ({ context }) => loadPostsIndexFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [
      { title: 'Writing - Max Zhang' },
      { name: 'description', content: 'Field notes from building AI products — methods, cases, and evaluation.' },
    ],
  }),
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  const posts = Route.useLoaderData()
  return <PostsClient posts={posts} />
}
