'use client'

import { PostItem } from '@/components/post-item'
import { Post } from '@/lib/posts'
import Fuse from 'fuse.js'
import { Folder, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface SearchClientProps {
	posts: Post[]
}

export function SearchClient({ posts }: SearchClientProps) {
	const searchParams = useSearchParams()
	const router = useRouter()

	// 从 URL 参数中获取初始状态（作为单一事实来源）
	const selectedTag = searchParams.get('tag') || ''
	const selectedCategory = searchParams.get('category') || ''
	const urlQuery = searchParams.get('q') || ''

	// 本地 state 仅用于输入框的受控显示，以便实现流畅的输入体验
	// 实际的搜索逻辑依赖于 URL 参数或这个 query 值（取决于具体实现策略）
	const [query, setQuery] = useState<string>(urlQuery)

	// 仅当 URL 参数由外部改变（如点击后退按钮）时，同步回本地 input state
	// 我们特意不将 'query' 列入依赖，以避免在输入时重置 input
	useEffect(() => {
		if (urlQuery !== query) {
			setQuery(urlQuery)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urlQuery])

	// 初始化 Fuse.js 模糊搜索实例
	// 使用 useMemo 缓存实例，避免每次渲染都重新建立索引
	const fuse = useMemo(() => {
		return new Fuse(posts, {
			keys: ['title', 'summary', 'tags', 'category', 'content'], // 搜索这些字段
			threshold: 0.3, // 模糊匹配阈值，越低越精确
			includeScore: true,
		})
	}, [posts])

	// 计算所有文章中出现过的唯一标签和分类
	const { allTags, allCategories } = useMemo(() => {
		const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()
		const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort()
		return { allTags: tags, allCategories: categories }
	}, [posts])

	// 核心过滤逻辑：根据当前的搜索词、标签和分类筛选文章
	const filteredPosts = useMemo(() => {
		// 如果没有任何筛选条件，返回空数组（显示“开始搜索”提示）
		if (!query && !selectedTag && !selectedCategory) {
			return []
		}

		let results = posts

		// 1. 文本搜索 (Fuse.js)
		// 优先使用本地 query 状态，实现输入时的即时反馈
		if (query) {
			const fuseResults = fuse.search(query)
			results = fuseResults.map((result) => result.item)
		}

		// 2. 标签过滤 (精确匹配)
		if (selectedTag) {
			results = results.filter((post) => post.tags.includes(selectedTag))
		}

		// 3. 分类过滤 (精确匹配)
		if (selectedCategory) {
			results = results.filter((post) => post.category === selectedCategory)
		}

		return results
	}, [posts, query, selectedTag, selectedCategory, fuse])

	// 更新 URL 参数的辅助函数
	const updateUrl = (newQuery: string, newTag: string, newCategory: string) => {
		const params = new URLSearchParams()
		if (newQuery) params.set('q', newQuery)
		if (newTag) params.set('tag', newTag)
		if (newCategory) params.set('category', newCategory)
		router.push(`/search?${params.toString()}`)
	}

	// 处理搜索框输入
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value
		setQuery(newQuery) // 更新输入框显示
		updateUrl(newQuery, selectedTag, selectedCategory) // 同步到 URL
	}

	// 处理标签点击
	const handleTagClick = (tag: string) => {
		// 如果点击当前已选中的标签，则取消选择
		const newTag = tag === selectedTag ? '' : tag
		updateUrl(query, newTag, selectedCategory)
	}

	// 处理分类点击
	const handleCategoryClick = (category: string) => {
		// 如果点击当前已选中的分类，则取消选择
		const newCategory = category === selectedCategory ? '' : category
		updateUrl(query, selectedTag, newCategory)
	}

	const clearFilters = () => {
		setQuery('')
		router.push('/search')
	}

	const clearTag = () => {
		updateUrl(query, '', selectedCategory)
	}

	const clearCategory = () => {
		updateUrl(query, selectedTag, '')
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
						onClick={() => {
							setQuery('')
							updateUrl('', selectedTag, selectedCategory)
						}}
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
