import { GlassCard } from '@/components/glass-card'
import { Post } from '@/lib/posts'
import { cn } from '@/lib/utils'
import { ArrowRight, Calendar, Clock, Folder } from 'lucide-react'
import Link from 'next/link'

interface PostItemProps {
	post: Post
}

export function PostItem({ post }: PostItemProps) {
	const tagColors = [
		'bg-secondary text-secondary-foreground border-border',
		'bg-primary text-primary-foreground border-border',
		'bg-accent text-accent-foreground border-border',
	]

	return (
		<Link href={`/posts/${post.slug}`} className="block group">
			<GlassCard className="p-8 transition-all duration-300 border-2 border-border/10 hover:border-primary group-hover:bg-secondary/5">
				<article className="flex flex-col space-y-4">
					<div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
						<time
							dateTime={post.date}
							className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md border border-border/5"
						>
							<Calendar className="h-4 w-4" />
							{post.date}
						</time>
						<span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md border border-border/5">
							<Clock className="h-4 w-4" />
							{post.readTime.text}
						</span>
						{post.category && (
							<span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/10">
								<Folder className="h-4 w-4" />
								{post.category}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<h2 className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
							{post.title}
							<ArrowRight className="h-6 w-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
						</h2>
						<p className="text-muted-foreground font-medium text-lg line-clamp-2 leading-relaxed italic border-l-4 border-muted pl-4">
							{post.summary}
						</p>
					</div>

					<div className="flex flex-wrap gap-2 pt-2">
						{post.tags.map((tag, tIdx) => (
							<span
								key={tag}
								className={cn(
									'inline-flex items-center rounded-lg border-2 px-3 py-1 text-[10px] font-black uppercase tracking-tight shadow-[2px_2px_0px_var(--border)] transition-all group-hover:shadow-none group-hover:translate-x-px group-hover:translate-y-px',
									tagColors[tIdx % tagColors.length],
								)}
							>
								{tag}
							</span>
						))}
					</div>
				</article>
			</GlassCard>
		</Link>
	)
}
