'use client'

import { PostItem } from '@/components/post-item'
import { Folder, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { GlassCard } from '@/components/glass-card'
import { Post } from '@/lib/posts'

interface PostsClientProps {
	posts: Post[]
	allTags: string[]
	allCategories: string[]
}

export function PostsClient({ posts, allTags, allCategories }: PostsClientProps) {
	return (
		<div className="container max-w-screen-2xl mx-auto px-4 py-10">
			{/* 页面标题区域 */}
			<FadeIn className="flex flex-col items-start gap-4 pb-12 border-b-4 border-border mb-12">
				<h1 className="text-5xl font-black tracking-tight sm:text-6xl">文章库</h1>
				<p className="text-muted-foreground text-xl font-medium">探索技术、设计与生活的交汇点。</p>
			</FadeIn>

			{/* 主内容区域 */}
			<div className="grid gap-12 sm:grid-cols-1 lg:grid-cols-[2fr_1fr]">
				{/* 左侧：文章列表 */}
				<StaggerContainer className="space-y-10" delay={0.2}>
					{posts.map((post) => (
						<StaggerItem key={post.slug}>
							<PostItem post={post} />
						</StaggerItem>
					))}
					{posts.length === 0 && (
						<GlassCard className="p-12 text-center">
							<p className="text-muted-foreground font-bold text-xl">暂无文章，敬请期待。</p>
						</GlassCard>
					)}
				</StaggerContainer>

				{/* 右侧：侧边栏 */}
				<aside className="space-y-10">
					<FadeIn className="hidden lg:block space-y-10 sticky top-24" delay={0.4}>
						{/* 热门分类模块 */}
						<GlassCard className="p-8">
							<h3 className="font-black text-xl mb-6 flex items-center gap-2">热门分类</h3>
							<div className="flex flex-col gap-3">
								{allCategories.map((category) => (
									<Link
										key={category}
										href={`/search?category=${encodeURIComponent(category)}`}
										className="flex items-center justify-between text-base font-bold hover:text-primary transition-all p-3 rounded-xl hover:bg-secondary/20 border-2 border-transparent hover:border-border"
									>
										<span className="flex items-center gap-3">
											<Folder className="h-5 w-5 text-primary" />
											{category}
										</span>
										<ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
									</Link>
								))}
								{allCategories.length === 0 && <p className="text-sm text-muted-foreground font-medium italic">暂无分类</p>}
							</div>
						</GlassCard>

						{/* 热门标签模块 */}
						<GlassCard className="p-8">
							<h3 className="font-black text-xl mb-6 flex items-center gap-2">热门标签</h3>
							<div className="flex flex-wrap gap-3">
								{allTags.map((tag) => (
									<Link
										key={tag}
										href={`/search?tag=${encodeURIComponent(tag)}`}
										className="inline-flex items-center rounded-xl border-2 border-border px-4 py-1.5 text-xs font-black transition-all bg-card text-foreground shadow-[3px_3px_0px_var(--border)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
									>
										{tag}
									</Link>
								))}
								{allTags.length === 0 && <p className="text-sm text-muted-foreground font-medium italic">暂无标签</p>}
							</div>
						</GlassCard>
					</FadeIn>
				</aside>
			</div>
		</div>
	)
}
