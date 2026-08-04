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
      <article style={{ padding: '32px 0' }}>
        <BackToPosts label={tPosts('back')} />

        <div className="article-panel">
          <div className="article-header">
            <h1 className="article-title">{post.title}</h1>

            <div className="article-meta">
              <span className="stat-pill">
                <Calendar className="size-3.5 text-primary" />
                {post.date}
              </span>
              <span className="stat-pill">
                <Clock className="size-3.5 text-primary" />
                {t('readingTime', { minutes: readingTime })}
              </span>
              <ViewCounter slug={post.slug} locale={locale} />
              <span className="stat-pill">
                <User className="size-3.5 text-primary" />
                {post.author}
              </span>
              <span className="meta-tag">
                <Folder className="size-3.5" />
                {post.category}
              </span>
              <a href="#comments" className="stat-pill no-underline">
                <MessageCircle className="size-3.5 text-primary" />
                <span>{commentCount}</span>
              </a>
            </div>

            <div className="article-toolbar">
              <AudioPlayer slug={post.slug} lang={locale} />
            </div>

            <div className="chip-row" style={{ marginTop: 16 }}>
              {post.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="article-prose">
            <Suspense
              fallback={
                <div className="empty-state" style={{ padding: '80px 20px' }}>
                  Loading article...
                </div>
              }
            >
              <PostMdx locale={locale} slug={post.slug} />
            </Suspense>
          </div>
        </div>

        <div id="comments" style={{ marginTop: 40 }}>
          <Comment slug={post.slug} locale={locale} />
        </div>
      </article>
      <BackToTop />
    </>
  )
}
