import { createFileRoute } from '@tanstack/react-router'
import { getAllPostsWithViewsFn, SearchClient } from '@/src/features/posts'

export const Route = createFileRoute('/zh/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
    tag: typeof search.tag === 'string' ? search.tag : '',
    category: typeof search.category === 'string' ? search.category : '',
  }),
  loader: ({ context }) => getAllPostsWithViewsFn({ data: { locale: context.locale } }),
  head: () => ({
    meta: [{ title: '检索文章 - Max Zhang' }, { name: 'description', content: '按关键词、标签或分类检索文章' }],
  }),
  component: SearchComponent,
})

function SearchComponent() {
  const posts = Route.useLoaderData()
  const search = Route.useSearch()
  return <SearchClient posts={posts} initialSearch={search} />
}
