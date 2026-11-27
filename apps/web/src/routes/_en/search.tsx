import { createFileRoute } from '@tanstack/react-router'
import { getAllPostsWithViewsFn, SearchClient } from '@/src/features/posts'

export const Route = createFileRoute('/_en/search')({
  validateSearch: (search: Record<string, unknown>) => {
    const q = typeof search.q === 'string' ? search.q : ''
    return q ? { q } : {}
  },
  loader: ({ context }) => getAllPostsWithViewsFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [{ title: 'Search - Max Zhang' }, { name: 'description', content: 'Search posts.' }],
  }),
  component: SearchComponent,
})

function SearchComponent() {
  const posts = Route.useLoaderData()
  const search = Route.useSearch()
  return <SearchClient posts={posts} initialSearch={search} />
}
