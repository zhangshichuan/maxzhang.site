import { getCommentCount } from '@/src/features/engagement/queries'
import { getAllPostsWithViews, getPostBySlug } from './posts'

/**
 * 文章详情页数据。
 *
 * 评论数在预渲染/构建期可能因数据库不可用而降级为 0，
 * 客户端评论区挂载后会通过 Server Function 拉取真实数据。
 */
export async function loadPostPage(slug: string, locale: string) {
  const post = getPostBySlug(slug, locale)
  let commentCount = 0

  try {
    commentCount = await getCommentCount(post.slug)
  } catch (error) {
    console.warn('Failed to load comment count, fallback to zero:', error)
  }

  return { post, commentCount }
}

/**
 * 文章列表页数据：文章 + 标签/分类聚合。
 */
export async function loadPostsIndex(locale: string) {
  const posts = await getAllPostsWithViews(locale)
  return {
    posts,
    allTags: Array.from(new Set(posts.flatMap((post) => post.tags))),
    allCategories: Array.from(new Set(posts.map((post) => post.category).filter(Boolean))),
  }
}
