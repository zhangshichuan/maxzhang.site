import { getAllPosts } from '@/lib/posts'
import { Calendar, Clock, Folder } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
	title: '文章库 - Max Zhang',
	description: 'Read my thoughts on software development, design, and more.',
}

export default function PostsPage() {
	const posts = getAllPosts()

	return (
		<div className="container max-w-7xl mx-auto px-4 py-10">
			<div className="flex flex-col items-start gap-4 pb-10">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">文章库</h1>
				<p className="text-muted-foreground text-lg">分享关于技术、设计和生活的思考。</p>
			</div>

			<div className="grid gap-10 sm:grid-cols-1 lg:grid-cols-[2fr_1fr]">
				{/* 文章列表 */}
				<div className="space-y-8">
					{posts.map((post) => (
						<article
							key={post.slug}
							className="group flex flex-col space-y-3 border-b border-border pb-8 last:border-0"
						>
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
										<span className="flex items-center gap-1">
											<Folder className="h-3.5 w-3.5" />
											{post.category}
										</span>
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
										<span
											key={tag}
											className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						</article>
					))}
					{posts.length === 0 && <p className="text-muted-foreground py-10">暂无文章。</p>}
				</div>

				{/* 侧边栏 (可选) */}
				<aside className="hidden lg:block space-y-8">
					<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 sticky top-20">
						<h3 className="font-semibold text-lg mb-4">热门标签</h3>
						<div className="flex flex-wrap gap-2">
							{['Next.js', 'React', 'TypeScript', 'Tailwind', 'DevOps', 'Design'].map((tag) => (
								<Link
									key={tag}
									href={`/tags/${tag.toLowerCase()}`}
									className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
								>
									{tag}
								</Link>
							))}
						</div>
					</div>
				</aside>
			</div>
		</div>
	)
}
