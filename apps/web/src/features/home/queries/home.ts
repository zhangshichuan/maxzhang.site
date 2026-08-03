import { getAllPostsWithViewsFn } from '@/src/features/posts/server-functions'

/**
 * 首页数据：最新 3 篇文章（含阅读量/评论数）。
 */
export async function getFeaturedPosts(locale: string) {
  const posts = await getAllPostsWithViewsFn({ data: { locale } })
  return posts.slice(0, 3)
}
