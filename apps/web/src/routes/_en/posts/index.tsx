import { createFileRoute } from '@tanstack/react-router'
import { loadPostsIndexFn, PostsClient } from '@/src/features/posts'

export const Route = createFileRoute('/_en/posts/')({
  loader: ({ context }) => loadPostsIndexFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [
      { title: 'Writing - Max Zhang' },
      { name: 'description', content: 'Engineering notes and AI product thinking' },
    ],
  }),
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  const data = Route.useLoaderData()
  return <PostsClient posts={data.posts} allTags={data.allTags} allCategories={data.allCategories} />
}
