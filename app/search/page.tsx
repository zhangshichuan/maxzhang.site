import { SearchClient } from '@/components/search-client'
import { getAllPosts } from '@/lib/posts'
import { Suspense } from 'react'

export const metadata = {
	title: '搜索 - Max Zhang',
	description: 'Search through my articles by keyword, tag, or category.',
}

export default function SearchPage() {
	const posts = getAllPosts()

	return (
		<div className="container max-w-3xl mx-auto px-4 py-10">
			<h1 className="text-3xl font-bold mb-8">搜索文章</h1>
			<Suspense fallback={<div className="text-center py-20 text-muted-foreground">加载搜索组件...</div>}>
				<SearchClient posts={posts} />
			</Suspense>
		</div>
	)
}