import { PostItem } from '@/components/post-item'
import { getAllPosts } from '@/lib/posts'
import { Folder } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
	title: '文章库 - Max Zhang',
	description: 'Read my thoughts on software development, design, and more.',
}

export default function PostsPage() {
	// 获取所有文章数据
	const posts = getAllPosts()

	// 动态计算所有文章中出现过的唯一标签
	// 使用 flatMap 将每篇文章的 tags 数组展平，然后 Set 去重
	const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)))

	// 动态计算所有文章中出现过的唯一分类
	// 过滤掉空的分类
	const allCategories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))

	return (
		<div className="container max-w-7xl mx-auto px-4 py-10">
			{/* 页面标题区域 */}
			<div className="flex flex-col items-start gap-4 pb-10">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">文章库</h1>
				<p className="text-muted-foreground text-lg">分享关于技术、设计和生活。</p>
			</div>

			{/* 主内容区域：使用 CSS Grid 布局，左侧文章列表，右侧侧边栏 */}
			<div className="grid gap-10 sm:grid-cols-1 lg:grid-cols-[2fr_1fr]">
				{/* 左侧：文章列表 */}
				<div className="space-y-8">
					{posts.map((post) => (
						<PostItem key={post.slug} post={post} />
					))}
					{posts.length === 0 && <p className="text-muted-foreground py-10">暂无文章。</p>}
				</div>

				{/* 右侧：侧边栏 (在大屏幕上显示) */}
				{/* sticky top-20: 实现侧边栏随页面滚动而固定的效果 */}
				<aside className="hidden lg:block space-y-8 sticky top-20">
					{/* 热门分类模块 */}
					<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
						<h3 className="font-semibold text-lg mb-4">热门分类</h3>
						<div className="flex flex-col gap-2">
							{allCategories.map((category) => (
								<Link
									key={category}
									href={`/search?category=${encodeURIComponent(category)}`}
									className="flex items-center justify-between text-sm hover:text-primary transition-colors"
								>
									<span className="flex items-center gap-2">
										<Folder className="h-4 w-4" />
										{category}
									</span>
								</Link>
							))}
							{allCategories.length === 0 && <p className="text-sm text-muted-foreground">暂无分类</p>}
						</div>
					</div>

					{/* 热门标签模块 */}
					<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
						<h3 className="font-semibold text-lg mb-4">热门标签</h3>
						<div className="flex flex-wrap gap-2">
							{allTags.map((tag) => (
								<Link
									key={tag}
									href={`/search?tag=${encodeURIComponent(tag)}`}
									className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
								>
									{tag}
								</Link>
							))}
							{allTags.length === 0 && <p className="text-sm text-muted-foreground">暂无标签</p>}
						</div>
					</div>
				</aside>
			</div>
		</div>
	)
}
