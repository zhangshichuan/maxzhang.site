import { getAllPosts } from '@/lib/posts'
import { HomeHero } from '@/components/home-hero'
import { FeaturedPosts } from '@/components/featured-posts'

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	const posts = getAllPosts(locale).slice(0, 3)

	return (
		<div className="container mx-auto max-w-screen-2xl space-y-20 px-4 py-10">
			<HomeHero />
			<FeaturedPosts posts={posts} locale={locale} />
		</div>
	)
}
