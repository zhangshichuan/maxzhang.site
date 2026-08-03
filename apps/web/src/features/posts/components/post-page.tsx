import { Comment, ViewCounter } from '@/src/features/engagement'
import type { Post } from '@/src/features/posts/model'
import { AudioPlayer, BackToPosts, BackToTop } from '@/src/shared/components'
import { useTranslations } from '@/src/i18n/client'
import { Calendar, Clock, Folder, MessageCircle, User } from 'lucide-react'
import { Suspense } from 'react'
import { PostMdx } from './post-mdx'

interface PostPageProps {
  post: Post
  commentCount: number
  locale: string
}

export function PostPage({ post, commentCount, locale }: PostPageProps) {
  const t = useTranslations('Common')
  const tPosts = useTranslations('PostsPage')
  const readingTime = Math.ceil(post.readTime.minutes)

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

            <AudioPlayer slug={post.slug} lang={locale} />

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
              <ViewCounter slug={post.slug} locale={locale} />
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
            <Suspense
              fallback={
                <div style={{ padding: '80px 20px', textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 14 }}>
                  Loading article...
                </div>
              }
            >
              <PostMdx locale={locale} slug={post.slug} />
            </Suspense>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="glitch-divider" style={{ marginTop: 40 }}>
          <span>&#9743;</span>
        </div>

        {/* 评论区域 */}
        <div id="comments" style={{ marginTop: 40 }}>
          <Comment slug={post.slug} locale={locale} />
        </div>
      </article>
      <BackToTop />
    </>
  )
}
