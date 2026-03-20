import { SearchClient } from '@/components/search-client'
import { getAllPosts } from '@/lib/posts'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>
}): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'SearchPage' })

	return {
		title: `${t('title')} - Max Zhang`,
		description: 'Search through my articles by keyword, tag, or category.',
	}
}

export default async function SearchPage() {
	const posts = getAllPosts()
	const t = await getTranslations('SearchPage')

	return (
		<div className="container max-w-3xl mx-auto px-4 py-10">
			<h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
			<Suspense fallback={<div className="text-center py-20 text-muted-foreground">{t('loading')}</div>}>
				<SearchClient posts={posts} />
			</Suspense>
		</div>
	)
}