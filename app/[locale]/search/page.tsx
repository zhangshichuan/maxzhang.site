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
    <div className="container mx-auto max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-8 border-b border-border/40 pb-6">
        <p className="font-sans text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">{t('title')}</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">{t('title')}</h1>
      </div>
      <Suspense
        fallback={
          <div className="py-20 text-center font-serif text-lg text-muted-foreground italic">{t('loading')}</div>
        }
      >
        <SearchClient posts={posts} />
      </Suspense>
    </div>
  )
}
