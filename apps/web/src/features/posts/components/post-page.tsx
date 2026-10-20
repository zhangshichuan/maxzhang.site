import { Comment, ViewCounter } from '@/src/features/engagement'
import type { Post } from '@/src/features/posts/model'
import { AudioPlayer, BackToPosts, BackToTop } from '@/src/shared/components'
import { useTranslations } from '@/src/i18n/client'
import { MessageCircle, Sparkles } from 'lucide-react'
import { Suspense } from 'react'
import '@/src/styles/paper-posts.css'
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
    <div className="pp-page pp-article">
      <article>
        <div className="pp-article-top">
          <BackToPosts label={tPosts('back')} />
          <span className="pp-kicker">{post.category}</span>
        </div>

        <header className="pp-article-head">
          <h1 className="pp-article-title">{post.title}</h1>

          <div className="pp-meta">
            {post.aiAssisted && (
              <span className="pp-ai" title={tPosts('aiAssistedHint')}>
                <Sparkles aria-hidden="true" />
                {tPosts('aiAssisted')}
              </span>
            )}
            <span className="pp-meta-item">{post.date}</span>
            <span className="pp-meta-item">{t('readingTime', { minutes: readingTime })}</span>
            <span className="pp-meta-item">{post.author}</span>
            <ViewCounter slug={post.slug} locale={locale} />
            <a href="#comments" className="pp-meta-link">
              <MessageCircle aria-hidden="true" />
              {commentCount}
            </a>
          </div>

          <div className="pp-tools">
            <AudioPlayer slug={post.slug} lang={locale} />
            <div className="pp-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="pp-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="pp-prose">
          <Suspense
            fallback={
              <div className="pp-loading" style={{ marginTop: 0 }}>
                Loading article...
              </div>
            }
          >
            <PostMdx locale={locale} slug={post.slug} />
          </Suspense>
        </div>
      </article>

      <section id="comments" className="pp-comments" aria-label="Comments">
        <Comment slug={post.slug} locale={locale} />
      </section>

      <BackToTop />
    </div>
  )
}
