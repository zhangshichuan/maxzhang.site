'use client'

import { PostItem } from '@/components/post-item'
import { Post } from '@/lib/posts'
import Fuse from 'fuse.js'
import { Folder, Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface SearchClientProps {
	posts: Post[]
}

export function SearchClient({ posts }: SearchClientProps) {
	const searchParams = useSearchParams()

	// 1. 初始化：仅在首次渲染时从 URL 读取参数作为初始状态
	// 后续 URL 的变化（除非是刷新页面）不会自动影响这些 State，实现了“解耦”
	// 使用函数式初始化来确保只读取一次
	const [query, setQuery] = useState(() => searchParams.get('q') || '')
	const [selectedTag, setSelectedTag] = useState(() => searchParams.get('tag') || '')
	const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || '')

	// 2. 初始化 Fuse.js 模糊搜索实例
	const fuse = useMemo(() => {
		return new Fuse(posts, {
			keys: ['title', 'summary', 'tags', 'category', 'content'],
			threshold: 0.3,
			includeScore: true,
		})
	}, [posts])

	// 计算唯一标签和分类
	const { allTags, allCategories } = useMemo(() => {
		const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()
		const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort()
		return { allTags: tags, allCategories: categories }
	}, [posts])

	// 3. 核心过滤逻辑：完全依赖本地 State 进行计算
	const filteredPosts = useMemo(() => {
		if (!query && !selectedTag && !selectedCategory) {
			return []
		}

		let results = posts

		// 文本搜索
		if (query) {
			const fuseResults = fuse.search(query)
			results = fuseResults.map((result) => result.item)
		}

		// 标签过滤
		if (selectedTag) {
			results = results.filter((post) => post.tags.includes(selectedTag))
		}

		// 分类过滤
		if (selectedCategory) {
			results = results.filter((post) => post.category === selectedCategory)
		}

		return results
	}, [posts, query, selectedTag, selectedCategory, fuse])

	// 4. URL 同步逻辑：当 State 变化时，防抖更新 URL，不触发 Next.js 导航
	useEffect(() => {
		const timer = setTimeout(() => {
			const params = new URLSearchParams()
			if (query) params.set('q', query)
			if (selectedTag) params.set('tag', selectedTag)
			if (selectedCategory) params.set('category', selectedCategory)

			// 构建新的 URL query string
			const queryString = params.toString()
			const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
			
			// 使用 history.replaceState 修改 URL 而不触发页面刷新或 Next.js 路由跳转
			// 这样就避免了触发服务端的 RSC 请求
			window.history.replaceState(null, '', newUrl)
		}, 300) // 300ms 防抖

		return () => clearTimeout(timer)
	}, [query, selectedTag, selectedCategory])

	// 事件处理：直接更新 Local State
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleTagClick = (tag: string) => {
		setSelectedTag((prev) => (prev === tag ? '' : tag))
	}

	const handleCategoryClick = (category: string) => {
		setSelectedCategory((prev) => (prev === category ? '' : category))
	}

	const clearFilters = () => {
		setQuery('')
		setSelectedTag('')
		setSelectedCategory('')
	}

	const clearTag = () => {
		setSelectedTag('')
	}

	const clearCategory = () => {
		setSelectedCategory('')
	}

	const hasFilters = Boolean(query || selectedTag || selectedCategory)

	return (
		<div className="space-y-8">
			{/* 搜索输入框区域 */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={handleSearch}
					placeholder="搜索文章标题、内容、标签..."
					className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
				/>
				{query && (
					<button
						onClick={() => setQuery('')}
						className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</button>
				)}
			</div>

			{/* 分类和标签选择区域 */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* 分类列表 */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
						<Folder className="h-4 w-4" /> 分类
					</h3>
					<div className="flex flex-wrap gap-2">
						{allCategories.map((category) => (
							<button
								key={category}
								onClick={() => handleCategoryClick(category)}
								className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
									selectedCategory === category
										? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
										: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
								}`}
							>
								{category}
							</button>
						))}
					</div>
				</div>

				{/* 标签列表 */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-muted-foreground">标签</h3>
					<div className="flex flex-wrap gap-2">
						{allTags.map((tag) => (
							<button
								key={tag}
								onClick={() => handleTagClick(tag)}
								className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
									selectedTag === tag
										? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
										: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
								}`}
							>
								{tag}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* 当前筛选条件展示 */}
			{hasFilters && (
				<div className="flex flex-wrap gap-2 items-center pt-4 border-t">
					<span className="text-sm text-muted-foreground">当前筛选:</span>
					{selectedCategory && (
						<span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20">
							分类: {selectedCategory}
							<button onClick={clearCategory} className="ml-1 hover:text-primary/70">
								<X className="h-3 w-3" />
							</button>
						</span>
					)}
					{selectedTag && (
						<span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20">
							标签: {selectedTag}
							<button onClick={clearTag} className="ml-1 hover:text-primary/70">
								<X className="h-3 w-3" />
							</button>
						</span>
					)}
					<button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary underline">
						清除所有
					</button>
				</div>
			)}

			{/* 搜索结果状态 */}
			{hasFilters && <div className="text-sm text-muted-foreground">找到 {filteredPosts.length} 篇相关文章</div>}

			{/* 文章列表 */}
			<div className="space-y-8">
				{filteredPosts.map((post) => (
					<PostItem key={post.slug} post={post} />
				))}

				{/* 状态：有筛选条件但无结果 */}
				{hasFilters && filteredPosts.length === 0 && (
					<div className="text-center py-20 text-muted-foreground">
						<Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
						<p className="text-lg">没有找到匹配的文章</p>
						<button onClick={clearFilters} className="mt-4 text-primary hover:underline">
							清除筛选条件
						</button>
					</div>
				)}

				{/* 状态：初始状态（无筛选） */}
				{!hasFilters && (
					<div className="text-center py-20 text-muted-foreground">
						<Search className="h-10 w-10 mx-auto mb-4 opacity-10" />
						<p className="text-lg">输入关键词或选择标签开始搜索</p>
					</div>
				)}
			</div>
		</div>
	)
}
