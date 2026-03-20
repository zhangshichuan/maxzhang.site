'use client'

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/glass-card'
import { cn } from '@/lib/utils'
import { Post } from '@/lib/posts'

interface FeaturedPostsProps {
	posts: Post[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
	const tagColors = [
		'bg-secondary text-secondary-foreground border-border',
		'bg-primary text-primary-foreground border-border',
		'bg-accent text-accent-foreground border-border',
		'bg-blue-400 text-white border-border',
		'bg-emerald-400 text-white border-border'
	]

	return (
		<section className="space-y-10">
			<FadeIn className="flex items-end justify-between border-b-4 border-border pb-4" delay={0.4}>
				<div className="space-y-1">
					<h2 className="text-3xl font-black tracking-tight">最新文章</h2>
					<p className="text-muted-foreground font-medium">探索技术与创意的边界</p>
				</div>
				<Link href="/posts" className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary hover:text-accent transition-colors">
					查看全部 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</Link>
			</FadeIn>

			<StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" delay={0.5}>
				{posts.map((post, idx) => (
					<StaggerItem key={post.slug}>
						<Link href={`/posts/${post.slug}`} className="block h-full group">
							<GlassCard className="h-full p-8 flex flex-col justify-between space-y-6">
								<div className="space-y-4">
									<div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
										<span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
											<Calendar className="h-3.5 w-3.5" />
											{post.date}
										</span>
										<span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
											<Clock className="h-3.5 w-3.5" />
											{post.readTime.text}
										</span>
									</div>
									<h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">
										{post.title}
									</h3>
									<p className="text-muted-foreground font-medium line-clamp-3 leading-relaxed">{post.summary}</p>
								</div>
								<div className="flex flex-wrap gap-2 pt-4">
									{post.tags.map((tag, tIdx) => (
										<span
											key={tag}
											className={cn(
												"inline-flex items-center rounded-lg border-2 px-3 py-1 text-xs font-black uppercase tracking-tight shadow-[2px_2px_0px_rgba(0,0,0,1)]",
												tagColors[(idx + tIdx) % tagColors.length]
											)}
										>
											{tag}
										</span>
									))}
								</div>
							</GlassCard>
						</Link>
					</StaggerItem>
				))}
			</StaggerContainer>
		</section>
	)
}
