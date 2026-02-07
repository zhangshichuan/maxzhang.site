import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import { ArrowLeft, Calendar, Clock, Folder, User } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
	params: Promise<{
		slug: string
	}>
}

export async function generateStaticParams() {
	const posts = getPostSlugs()
	return posts.map((post) => ({
		slug: post.replace(/\.mdx?$/, ''),
	}))
}

export async function generateMetadata({ params }: Props) {
	const { slug } = await params
	const post = getPostBySlug(slug)

	if (!post) {
		return {
			title: 'Post Not Found',
		}
	}

	return {
		title: `${post.title} - Max Zhang`,
		description: post.summary,
	}
}

export default async function PostPage({ params }: Props) {
	const { slug } = await params
	let post
	try {
		post = getPostBySlug(slug)
	} catch {
		notFound()
	}

	return (
		<article className="container max-w-3xl mx-auto px-4 py-10">
			<Link
				href="/posts"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
			>
				<ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
				返回文章列表
			</Link>

			<header className="mb-10 space-y-4">
				<h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>

				<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
					<time dateTime={post.date} className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						{post.date}
					</time>
					<span className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						{post.readTime.text}
					</span>
					<span className="flex items-center gap-1">
						<User className="h-4 w-4" />
						{post.author}
					</span>
					<span className="flex items-center gap-1">
						<Folder className="h-4 w-4" />
						{post.category}
					</span>

					<div className="flex gap-2 ml-auto">
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
			</header>

			<div className="prose prose-zinc dark:prose-invert max-w-none">
				<MDXRemote source={post.content} />
			</div>
		</article>
	)
}
