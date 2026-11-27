import { createFileRoute } from '@tanstack/react-router'
import { getAllPostsWithViewsFn, SearchClient } from '@/src/features/posts'

export const Route = createFileRoute('/zh/search')({
  validateSearch: (search: Record<string, unknown>) => {
    const q = typeof search.q === 'string' ? search.q : ''
    return q ? { q } : {}
  },
  loader: ({ context }) => getAllPostsWithViewsFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [{ title: '搜索 - Max Zhang' }, { name: 'description', content: '搜索文章' }],
  }),
  component: SearchComponent,
})

function SearchComponent() {
  const posts = Route.useLoaderData()
  const search = Route.useSearch()
  return <SearchClient posts={posts} initialSearch={search} />
}
