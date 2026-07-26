import { getAllPostsWithViews, PostsClient } from '@/src/features/posts'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PostsPage' })

  return {
    title: `${t('title')} - Max Zhang`,
    description: 'Read my thoughts on software development, design, and more.',
  }
}

export default async function PostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await getAllPostsWithViews(locale)
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)))
  const allCategories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))

  return (
    <div style={{ padding: '40px 0' }}>
      <PostsClient posts={posts} allTags={allTags} allCategories={allCategories} />
    </div>
  )
}
