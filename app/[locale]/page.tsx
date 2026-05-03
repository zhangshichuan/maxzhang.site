import { HomeHero } from '@/src/features/home'
import { FeaturedPosts, getAllPostsWithViews } from '@/src/features/posts'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await getAllPostsWithViews(locale).then((p) => p.slice(0, 3))

  return (
    <div className="container mx-auto max-w-screen-2xl space-y-16 px-6 py-10 md:px-8">
      <HomeHero />
      <FeaturedPosts posts={posts} />
    </div>
  )
}
