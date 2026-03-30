import { SearchClient } from '@/components/search-client'
import { getAllPostsWithViews } from '@/lib/posts'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SearchPage' })

  return {
    title: `${t('title')} - Max Zhang`, // SearchPage/title 搜索文章
    description: 'Search through my articles by keyword, tag, or category.',
  }
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await getAllPostsWithViews(locale)
  const t = await getTranslations('SearchPage')

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        {t('title')} {/* SearchPage/title 搜索文章 */}
      </h1>
      <Suspense
        fallback={
          <div className="py-20 text-center text-muted-foreground">
            {t('loading')} {/* SearchPage/loading 加载搜索组件... */}
          </div>
        }
      >
        <SearchClient posts={posts} />
      </Suspense>
    </div>
  )
}
