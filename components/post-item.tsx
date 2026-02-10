import { Post } from '@/lib/posts'
import { Calendar, Clock, Folder } from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/glass-card'

interface PostItemProps {
	post: Post
}

export function PostItem({ post }: PostItemProps) {
	return (
		<Link href={`/posts/${post.slug}`} className="block group">
			<GlassCard className="p-6 transition-all duration-300">
				<article className="flex flex-col space-y-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<time dateTime={post.date} className="flex items-center gap-1">
							<Calendar className="h-3.5 w-3.5" />
							{post.date}
						</time>
						<span>•</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							{post.readTime.text}
						</span>
						{post.category && (
							<>
								<span>•</span>
								<span className="flex items-center gap-1 hover:text-primary transition-colors">
									<Folder className="h-3.5 w-3.5" />
									{post.category}
								</span>
							</>
						)}
					</div>

					<h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors mb-2">
						{post.title}
					</h2>

					<p className="text-muted-foreground line-clamp-2">{post.summary}</p>

					<div className="flex items-center gap-4 text-sm pt-2">
						<div className="flex gap-2">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold bg-white/5 text-muted-foreground transition-colors group-hover:bg-white/10"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				</article>
			</GlassCard>
		</Link>
	)
}
