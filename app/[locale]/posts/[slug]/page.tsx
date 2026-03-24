import Mermaid from '@/components/mdx/mermaid'
import { Link } from '@/i18n/routing'
import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import { ArrowLeft, Calendar, Clock, Folder, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import * as React from 'react'
import remarkGfm from 'remark-gfm'

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
	const locales = ['en', 'zh']

	const params = []
	for (const locale of locales) {
		const posts = getPostSlugs(locale)
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
	const { slug, locale } = await params
	const post = getPostBySlug(slug, locale)

	if (!post) {
		return {
			title: 'Post Not Found',
		}
	}

	return {
		title: `${post.title} - Max Zhang`,
		description: post.summary,
		keywords: post.tags.join(', '),
	}
}

const components = {
	pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => {
		// 检查子元素是否是 code，且类名为 language-mermaid
		if (
			React.isValidElement(children) &&
			typeof children.props === 'object' &&
			children.props !== null &&
			'className' in children.props &&
			children.props.className === 'language-mermaid'
		) {
			const chart = 'children' in children.props ? String(children.props.children) : ''
			return <Mermaid chart={chart.replace(/\n$/, '')} />
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

import { redirect } from 'next/navigation'

export default async function PostPage({ params }: Props) {
	const { slug, locale } = await params
	const t = await getTranslations({ locale, namespace: 'Common' })
	const tPosts = await getTranslations({ locale, namespace: 'PostsPage' })

	let post
	try {
		post = getPostBySlug(slug, locale)
	} catch {
		// 核心逻辑：如果当前文章没有对应语言的版本，
		// 不报 404，而是优雅地跳转回该语言的文章列表页
		console.warn(`Post not found: ${slug} for locale: ${locale}. Redirecting...`)
		redirect(`/${locale}/posts`)
	}

	// Format reading time
	const readingTime = Math.ceil(post.readTime.minutes)

	return (
		<article className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
			{/* 返回链接 */}
			<Link
				href="/posts"
				className="
      group mb-10 inline-flex items-center rounded-xl border-2
      border-transparent bg-secondary/10 px-4 py-2 text-sm font-black
      tracking-widest text-muted-foreground uppercase transition-all
      hover:border-border hover:text-primary
    "
			>
				<ArrowLeft
					className="
      mr-2 size-5 transition-transform
      group-hover:-translate-x-1
    "
				/>
				{tPosts('back')}
			</Link>

			<header className="mb-16 space-y-8">
				{/* 文章标题 */}
				<h1
					className="
      text-4xl leading-[1.1] font-black tracking-tight text-foreground underline
      decoration-primary/20 decoration-8 underline-offset-8
      sm:text-5xl
      lg:text-7xl
    "
				>
					{post.title}
				</h1>

				{/* 文章元信息 */}
				<div
					className="
      flex flex-wrap items-center gap-6 text-sm font-bold tracking-wider
      text-muted-foreground uppercase
    "
				>
					<time
						dateTime={post.date}
						className="
       flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5
     "
					>
						<Calendar className="size-5 text-primary" />
						{post.date}
					</time>
					<span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
						<Clock className="size-5 text-accent" />
						{t('readingTime', { minutes: readingTime })}
					</span>
					<span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
						<User className="size-5 text-secondary-foreground" />
						{post.author}
					</span>
					<span
						className="
       flex items-center gap-2 rounded-lg border-2 border-primary/10
       bg-primary/10 px-3 py-1.5 text-primary
     "
					>
						<Folder className="size-5" />
						{post.category}
					</span>

					<div className="ml-auto flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="
          bg-card inline-flex items-center rounded-lg border-2 border-border
          px-3 py-1 text-[10px] font-black shadow-[3px_3px_0px_var(--border)]
        "
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</header>

			{/* MDX 内容渲染区域 */}
			<div
				className="
     prose max-w-none prose-zinc
     dark:prose-invert
     prose-h2:text-4xl prose-h2:font-black
     prose-h3:text-2xl prose-h3:font-black
     prose-p:text-lg/relaxed
     prose-a:text-accent prose-a:no-underline
     hover:prose-a:underline
     prose-strong:text-primary
   "
			>
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
