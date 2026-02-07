'use client'

import { FileText, Search as SearchIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

// Mock Data
const allPosts = [
	{
		slug: 'building-modern-site-with-nextjs',
		title: '使用 Next.js 16 构建现代全栈网站',
		summary: '探索 Next.js 的最新特性...',
	},
	{
		slug: 'understanding-react-server-components',
		title: '深入理解 React Server Components',
		summary: 'RSC 到底是什么？...',
	},
	{ slug: 'tailwind-css-v4-features', title: 'Tailwind CSS v4 新特性概览', summary: '更快的构建速度...' },
	{ slug: 'dockerizing-nextjs-app', title: 'Docker 化 Next.js 应用的最佳实践', summary: '如何使用 Standalone 模式...' },
]

export default function SearchPage() {
	const [query, setQuery] = React.useState('')

	const filteredPosts = React.useMemo(() => {
		if (!query) return []
		return allPosts.filter(
			(post) =>
				post.title.toLowerCase().includes(query.toLowerCase()) ||
				post.summary.toLowerCase().includes(query.toLowerCase()),
		)
	}, [query])

	return (
		<div className="container max-w-3xl mx-auto px-4 py-20 min-h-[60vh]">
			<div className="flex flex-col gap-8">
				<h1 className="text-3xl font-bold text-center">搜索文章</h1>

				<div className="relative">
					<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					<input
						type="text"
						placeholder="输入关键词搜索..."
						className="flex h-14 w-full rounded-full border border-input bg-background px-12 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						autoFocus
					/>
				</div>

				<div className="space-y-4">
					{query && filteredPosts.length === 0 && (
						<div className="text-center text-muted-foreground py-10">没有找到与 &quot;{query}&quot; 相关的文章。</div>
					)}

					{filteredPosts.map((post) => (
						<Link key={post.slug} href={`/posts/${post.slug}`}>
							<div className="group rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer">
								<div className="flex items-start gap-3">
									<FileText className="h-5 w-5 text-muted-foreground mt-1" />
									<div>
										<h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
										<p className="text-sm text-muted-foreground mt-1">{post.summary}</p>
									</div>
								</div>
							</div>
						</Link>
					))}

					{!query && (
						<div className="text-center mt-10">
							<h3 className="text-sm font-medium text-muted-foreground mb-4">热门搜索</h3>
							<div className="flex flex-wrap justify-center gap-2">
								{['Next.js', 'React', 'Docker', 'Tailwind'].map((tag) => (
									<button
										key={tag}
										onClick={() => setQuery(tag)}
										className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-secondary"
									>
										{tag}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
