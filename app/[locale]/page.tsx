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
		<div className="container max-w-screen-2xl mx-auto px-4 py-10 space-y-20">
			<HomeHero />
			<FeaturedPosts posts={posts} />
		</div>
	)
}
