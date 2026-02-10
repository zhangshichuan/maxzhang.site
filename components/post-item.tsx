import { Post } from '@/lib/posts'
import { Calendar, Clock, Folder } from 'lucide-react'
import Link from 'next/link'

interface PostItemProps {
	post: Post
}

export function PostItem({ post }: PostItemProps) {
	return (
		<article className="group flex flex-col space-y-3 border-b border-border pb-8 last:border-0">
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
						<Link
							href={`/search?category=${encodeURIComponent(post.category)}`}
							className="flex items-center gap-1 hover:text-primary transition-colors"
						>
							<Folder className="h-3.5 w-3.5" />
							{post.category}
						</Link>
					</>
				)}
			</div>

			<Link href={`/posts/${post.slug}`} className="block">
				<h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors mb-2">
					{post.title}
				</h2>
			</Link>

			<p className="text-muted-foreground line-clamp-2">{post.summary}</p>

			<div className="flex items-center gap-4 text-sm pt-2">
				<div className="flex gap-2">
					{post.tags.map((tag) => (
						<Link
							key={tag}
							href={`/search?tag=${encodeURIComponent(tag)}`}
							className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
						>
							{tag}
						</Link>
					))}
				</div>
			</div>
		</article>
	)
}
