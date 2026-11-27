import { Comment, ViewCounter } from '@/src/features/engagement'
import type { Post } from '@/src/features/posts/model'
import { AudioPlayer, BackToTop } from '@/src/shared/components'
import { useTranslations } from '@/src/i18n/client'
import { MessageCircle } from 'lucide-react'
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
    <div className="ni-page ni-article">
      <article>
        <header className="ni-article-head">
          <div className="ni-article-kicker">
            <span>{t('readingTime', { minutes: readingTime })}</span>
            {post.aiAssisted && <span className="ni-article-ai">{tPosts('aiAssisted')}</span>}
          </div>

          <h1 className="ni-article-title">{post.title}</h1>

          <div className="ni-article-meta">
            <span>{post.date}</span>
            {post.updated && post.updated !== post.date && <span>{tPosts('updated', { date: post.updated })}</span>}
            <span>{post.author}</span>
            <ViewCounter slug={post.slug} locale={locale} />
            <a href="#comments">
              <MessageCircle aria-hidden="true" />
              {commentCount}
            </a>
          </div>

          <div className="ni-article-tools">
            <AudioPlayer slug={post.slug} lang={locale} />
          </div>
        </header>

        <div className="ni-prose">
          <Suspense
            fallback={
              <div className="ni-loading" style={{ marginTop: 0 }}>
                Loading article...
              </div>
            }
          >
            <PostMdx locale={locale} slug={post.slug} />
          </Suspense>
        </div>
      </article>

      <section id="comments" className="ni-comments" aria-label="Comments">
        <Comment slug={post.slug} locale={locale} />
      </section>

      <BackToTop />
    </div>
  )
}
