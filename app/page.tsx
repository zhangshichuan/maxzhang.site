import { Button } from '@/components/ui/button'
import { getAllPosts } from '@/lib/posts'
import { ArrowRight, Calendar, Clock, Folder } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
	const posts = getAllPosts().slice(0, 3)

	return (
		<div className="container max-w-screen-2xl mx-auto px-4 py-10 space-y-20">
			{/* Hero Section */}
			<section className="flex flex-col items-start gap-6 pt-10 md:pt-20 lg:pt-32">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
						Hi, I&apos;m Max Zhang.
					</h1>
					<p className="max-w-150 text-muted-foreground md:text-xl">Build with Purpose. Power with AI.</p>
				</div>
				<div className="flex gap-4">
					<Link href="/posts">
						<Button size="lg" className="cursor-pointer">
							阅读文章 <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
					<Link href="/about">
						<Button variant="outline" size="lg" className="cursor-pointer">
							关于我
						</Button>
					</Link>
				</div>
			</section>

			{/* Featured Posts Section */}
			<section className="space-y-8">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold tracking-tight">最新文章</h2>
					<Link href="/posts" className="text-sm font-medium text-muted-foreground hover:text-foreground">
						查看全部
					</Link>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<Link
							key={post.slug}
							href={`/posts/${post.slug}`}
							className="group relative flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card hover:border-primary/50"
						>
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{post.date}
									</span>
									<span>•</span>
									<span className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										{post.readTime.text}
									</span>
									{post.category && (
										<>
											<span>•</span>
											<span className="flex items-center gap-1">
												<Folder className="h-3 w-3" />
												{post.category}
											</span>
										</>
									)}
								</div>
								<h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
									{post.title}
								</h3>
								<p className="text-muted-foreground line-clamp-3">{post.summary}</p>
							</div>
							<div className="flex gap-2 pt-4">
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground"
									>
										{tag}
									</span>
								))}
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	)
}
