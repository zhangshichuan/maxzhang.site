import { createFileRoute } from '@tanstack/react-router'
import { loadPostsIndex, PostsClient } from '@/src/features/posts'

export const Route = createFileRoute('/en/posts/')({
  loader: ({ context }) => loadPostsIndex(context.locale),
  head: () => ({
    meta: [
      { title: 'Journal - Max Zhang' },
      { name: 'description', content: 'Where technology, design, and life intersect.' },
    ],
  }),
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  const data = Route.useLoaderData()
  return <PostsClient posts={data.posts} allTags={data.allTags} allCategories={data.allCategories} />
}
