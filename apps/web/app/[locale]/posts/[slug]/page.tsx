import { Comment, ViewCounter, getCommentCount } from '@/src/features/engagement'
import { getPostBySlug, getPostSlugs } from '@/src/features/posts'
import { AudioPlayer, BackToPosts, BackToTop, Mermaid } from '@/src/shared/components'
import { Calendar, Clock, Folder, MessageCircle, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { redirect } from 'next/navigation'
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
      params.push({ locale, slug: post.replace(/\.mdx?$/, '') })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params
  const post = getPostBySlug(slug, locale, false)
  if (!post) {
    return { title: 'Post Not Found' }
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
      <article style={{ padding: '40px 0' }}>
        <BackToPosts label={tPosts('back')} />

        {/* 文章头部 + 正文：终端阅读面板，隔离粒子背景 */}
        <div className="article-panel">
          <div className="article-header" style={{ marginTop: 0 }}>
            <div className="glitch-divider">
              <span>&#9670;</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px,5vw,48px)',
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#fff',
                textShadow: '0 0 30px rgba(255,45,149,.2)',
                marginBottom: 20,
              }}
            >
              {post.title}
            </h1>

            <AudioPlayer slug={slug} lang={locale} />

            <div
              className="bio"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                marginTop: 12,
                maxWidth: 'none',
                fontSize: 11,
                lineHeight: 1,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.3)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar style={{ width: 14, height: 14, color: 'var(--neon)' }} />
                {post.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock style={{ width: 14, height: 14, color: 'var(--neon)' }} />
                {t('readingTime', { minutes: readingTime })}
              </span>
              <ViewCounter slug={slug} locale={locale} />
              <a
                href="#comments"
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', textDecoration: 'none' }}
              >
                <MessageCircle style={{ width: 14, height: 14 }} />
                <span>{commentCount}</span>
              </a>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User style={{ width: 14, height: 14, color: 'var(--neon)' }} />
                {post.author}
              </span>
              <span className="meta-tag">
                <Folder style={{ width: 12, height: 12 }} />
                {post.category}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="glitch-divider" style={{ marginTop: 16 }}>
              <span>&#9670;</span>
            </div>
          </div>

          {/* MDX 内容 */}
          <div className="article-prose">
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
        </div>

        {/* 底部装饰 */}
        <div className="glitch-divider" style={{ marginTop: 40 }}>
          <span>&#9743;</span>
        </div>

        {/* 评论区域 */}
        <div id="comments" style={{ marginTop: 40 }}>
          <Comment slug={slug} locale={locale} />
        </div>
      </article>
      <BackToTop />
    </>
  )
}
