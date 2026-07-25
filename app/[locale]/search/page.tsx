import { getAllPostsWithViews, SearchClient } from '@/src/features/posts'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SearchPage' })

  return {
    title: `${t('title')} - Max Zhang`,
    description: 'Search through my articles by keyword, tag, or category.',
  }
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await getAllPostsWithViews(locale)
  const t = await getTranslations('SearchPage')

  return (
    <div style={{ padding: '40px 0' }}>
      <Suspense
        fallback={
          <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: 14, color: 'rgba(255,255,255,.2)' }}>
            {t('loading')}
          </div>
        }
      >
        <SearchClient posts={posts} />
      </Suspense>
    </div>
  )
}
