import { Comment, ViewCounter, getCommentCount } from '@/src/features/engagement'
import { getPostBySlug, getPostSlugs } from '@/src/features/posts'
import { AudioPlayer, BackToPosts, BackToTop, Mermaid } from '@/src/shared/components'
import { Calendar, Clock, Folder, User } from 'lucide-react'
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

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params
  const post = getPostBySlug(slug, locale, false)

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

import { MessageCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function PostPage({ params }: Props) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Common' })
  const tPosts = await getTranslations({ locale, namespace: 'PostsPage' })

  let post
  try {
    post = getPostBySlug(slug, locale)
  } catch {
    console.warn(`Post not found: ${slug} for locale: ${locale}. Redirecting...`)
    redirect(`/${locale}/posts`)
  }

  const readingTime = Math.ceil(post.readTime.minutes)
  const commentCount = await getCommentCount(slug)

  return (
    <>
      <article className="container mx-auto max-w-3xl px-6 py-12 md:px-8">
        {/* 返回链接 */}
        <BackToPosts label={tPosts('back')} />

        {/* 文章头部 */}
        <header className="mb-12 space-y-6">
          {/* 装饰线 */}
          <div className="ornament-divider">&#9670;</div>

          <h1 className="font-serif text-4xl leading-[1.2] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* 语音播报 */}
          <AudioPlayer slug={slug} lang={locale} />

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 font-sans text-sm tracking-wide text-muted-foreground">
            <time dateTime={post.date} className="flex items-center gap-1.5">
              <Calendar className="size-4 text-primary/60" />
              {post.date}
            </time>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary/60" />
              {t('readingTime', { minutes: readingTime })}
            </span>
            <ViewCounter slug={slug} locale={locale} />
            <a
              href="#comments"
              className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-primary"
            >
              <MessageCircle className="size-4 text-primary/60" />
              <span>{commentCount}</span>
            </a>
            <span className="flex items-center gap-1.5">
              <User className="size-4 text-primary/60" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5 rounded-sm bg-muted/50 px-2 py-0.5 text-primary">
              <Folder className="size-4" />
              {post.category}
            </span>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-sm border border-border/40 bg-card px-2.5 py-0.5 font-sans text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="ornament-divider">&#9670;</div>
        </header>

        {/* MDX 内容 - 首字下沉 */}
        <div className="drop-cap article-prose">
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

        {/* 文章底部装饰 */}
        <div className="ornament-divider mt-16">&#9743;</div>

        {/* 评论区域 */}
        <div id="comments" className="mt-12">
          <Comment slug={slug} locale={locale} />
        </div>
      </article>
      <BackToTop />
    </>
  )
}
