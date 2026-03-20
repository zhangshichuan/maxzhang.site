import * as React from 'react'
import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import { ArrowLeft, Calendar, Clock, Folder, User } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Link } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import remarkGfm from 'remark-gfm'
import Mermaid from '@/components/mdx/mermaid'
import { getTranslations } from 'next-intl/server'

interface Props {
	params: Promise<{
		slug: string
		locale: string
	}>
}

/**
 * 生成静态路由参数 (SSG)
 * Next.js 在构建时会运行此函数，获取所有文章的 slug，
 * 并预渲染每篇文章的 HTML 页面。
 */
export async function generateStaticParams() {
	const posts = getPostSlugs()
	const locales = ['en', 'zh']
	
	const params = []
	for (const locale of locales) {
		for (const post of posts) {
			params.push({
				locale,
				slug: post.replace(/\.mdx?$/, ''),
			})
		}
	}
	return params
}

/**
 * 生成动态 Metadata (SEO)
 * 根据 URL 中的 slug 获取文章标题和摘要，用于页面 <head> 中的 meta标签。
 */
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

const components = {
	pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => {
		// 检查子元素是否是 code，且类名为 language-mermaid
		if (React.isValidElement(children) && (children.props as any)?.className === 'language-mermaid') {
			return <Mermaid chart={String((children.props as any).children).replace(/\n$/, '')} />
		}
		return <pre {...props}>{children}</pre>
	},
	code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
		return (
			<code className={className} {...props}>
				{children}
			</code>
		)
	},
}

export default async function PostPage({ params }: Props) {
	const { slug, locale } = await params
	const t = await getTranslations({ locale, namespace: 'Common' })
	const tPosts = await getTranslations({ locale, namespace: 'PostsPage' })
	
	let post
	try {
		post = getPostBySlug(slug)
	} catch {
		// 如果找不到对应的文章，显示 404 页面
		notFound()
	}

	// Format reading time
	const readingTime = Math.ceil(post.readTime.minutes)

	return (
		<article className="container max-w-4xl mx-auto px-6 py-12">
			{/* 返回链接 */}
			<Link
				href="/posts"
				className="inline-flex items-center text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all mb-10 group bg-secondary/10 px-4 py-2 rounded-xl border-2 border-transparent hover:border-border"
			>
				<ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
				{tPosts('back')}
			</Link>

			<header className="mb-16 space-y-8">
				{/* 文章标题 */}
				<h1 className="text-5xl font-black tracking-tight lg:text-7xl text-foreground leading-[1.1] underline decoration-primary/20 decoration-8 underline-offset-8">
					{post.title}
				</h1>

				{/* 文章元信息 */}
				<div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-bold uppercase tracking-wider">
					<time dateTime={post.date} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
						<Calendar className="h-5 w-5 text-primary" />
						{post.date}
					</time>
					<span className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
						<Clock className="h-5 w-5 text-accent" />
						{t('readingTime', { minutes: readingTime })}
					</span>
					<span className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
						<User className="h-5 w-5 text-secondary-foreground" />
						{post.author}
					</span>
					<span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg border-2 border-primary/10">
						<Folder className="h-5 w-5" />
						{post.category}
					</span>

					<div className="flex flex-wrap gap-2 ml-auto">
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center rounded-lg border-2 border-border bg-card px-3 py-1 text-[10px] font-black shadow-[3px_3px_0px_var(--border)]"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</header>

			{/* MDX 内容渲染区域 */}
			<div className="prose prose-zinc dark:prose-invert max-w-none prose-h2:text-4xl prose-h2:font-black prose-h3:text-2xl prose-h3:font-black prose-p:text-lg prose-p:leading-relaxed prose-strong:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
				<MDXRemote
					source={post.content}
					components={components}
					options={{
						mdxOptions: {
							remarkPlugins: [remarkGfm],
						},
					}}
				/>
			</div>
		</article>
	)
}
