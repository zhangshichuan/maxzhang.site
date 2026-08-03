import { createFileRoute } from '@tanstack/react-router'
import { getAllPostsWithViews, SearchClient } from '@/src/features/posts'

export const Route = createFileRoute('/en/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
    tag: typeof search.tag === 'string' ? search.tag : '',
    category: typeof search.category === 'string' ? search.category : '',
  }),
  loader: ({ context }) => getAllPostsWithViews(context.locale),
  head: () => ({
    meta: [
      { title: 'Search Articles - Max Zhang' },
      { name: 'description', content: 'Search articles by keyword, tag, or category.' },
    ],
  }),
  component: SearchComponent,
})

function SearchComponent() {
  const posts = Route.useLoaderData()
  const search = Route.useSearch()
  return <SearchClient posts={posts} initialSearch={search} />
}
