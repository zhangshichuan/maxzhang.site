import { HomeHero } from '@/src/features/home'
import { FeaturedPosts, getAllPostsWithViews } from '@/src/features/posts'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await getAllPostsWithViews(locale).then((p) => p.slice(0, 3))

  return (
    <>
      <HomeHero />
      <FeaturedPosts posts={posts} />
    </>
  )
}
