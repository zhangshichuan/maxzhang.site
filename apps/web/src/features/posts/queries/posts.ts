import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

import { getCommentCounts } from '@/src/features/engagement/queries'
import { getViewCounts } from '@/src/features/engagement/queries'
import type { Post, PostSummary, PostSummaryWithViews } from '@/src/features/posts/model'
import { routing } from '@/i18n/routing'

/**
 * 文章查询模块
 *
 * 负责从本地 `articles` 目录读取 md/mdx 文章，
 * 解析 frontmatter，并合并阅读量与评论数等互动指标。
 */
const postsDirectory = path.join(process.cwd(), 'articles')

/**
 * 将文章摘要与互动指标合并，并按发布日期倒序输出。
 */
export function composePostsWithMetrics(
  posts: PostSummary[],
  viewCounts: Record<string, number>,
  commentCounts: Record<string, number>,
): PostSummaryWithViews[] {
  return [...posts]
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
    .map((post) => ({
      ...post,
      views: viewCounts[post.slug] || 0,
      comments: commentCounts[post.slug] || 0,
    }))
}

/**
 * 获取指定语言下的文章文件名列表。
 * 如果对应语言目录不存在，则回退到文章根目录，兼容旧的非多语言结构。
 */
export function getPostSlugs(locale: string = routing.defaultLocale) {
  const localeDir = path.join(postsDirectory, locale)

  if (!fs.existsSync(localeDir)) {
    if (!fs.existsSync(postsDirectory)) return []
    return fs.readdirSync(postsDirectory).filter((file) => file.match(/\.mdx?$/))
  }

  return fs.readdirSync(localeDir).filter((file) => file.match(/\.mdx?$/))
}

export function getPostBySlug(slug: string, locale: string, includeContent: false): PostSummary
export function getPostBySlug(slug: string, locale?: string, includeContent?: true): Post
/**
 * 按 slug 读取单篇文章。
 *
 * 读取顺序会优先尝试当前语言目录，再回退到根目录；
 * 同时兼容 `.mdx` 和 `.md` 两种扩展名。
 */
export function getPostBySlug(
  slug: string,
  locale: string = routing.defaultLocale,
  includeContent: boolean = true,
): Post | PostSummary {
  const realSlug = decodeURIComponent(slug).replace(/\.mdx?$/, '')

  // 先查找当前语言目录中的文章文件。
  let fullPath = path.join(postsDirectory, locale, `${realSlug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, locale, `${realSlug}.md`)
  }

  // 语言目录下不存在时，回退到根目录，兼容未迁移的旧文章。
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${realSlug}.md`)
    }
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${realSlug} in locale: ${locale}`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const stats = readingTime(content)

  // 统一整理 frontmatter，给缺失字段补默认值，方便上层直接消费。
  const postBase = {
    slug: realSlug,
    title: data.title,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    summary: data.summary || '',
    readTime: stats,
    tags: data.tags || [],
    author: data.author || 'Max Zhang',
    category: data.category || 'Uncategorized',
    ...data,
  }

  if (includeContent) {
    return { ...postBase, content } as Post
  }

  return postBase as PostSummary
}

/**
 * 获取文章列表并批量附加阅读量、评论数。
 * 这里先读取本地文章，再并行查询数据库中的互动数据。
 */
export async function getAllPostsWithViews(locale: string = routing.defaultLocale): Promise<PostSummaryWithViews[]> {
  const slugs = getPostSlugs(locale)

  const posts = slugs
    .map((slug) => {
      try {
        return getPostBySlug(slug, locale, false)
      } catch (error) {
        console.error(error)
        return null
      }
    })
    .filter((post): post is PostSummary => post !== null)

  const slugsForQuery = slugs.map((slug) => slug.replace(/\.mdx?$/, ''))

  // 预渲染/构建期可能没有数据库（SQLite 文件不入库），
  // 指标查询失败时降级为 0，保证内容页仍可静态生成。
  let viewCounts: Record<string, number> = {}
  let commentCounts: Record<string, number> = {}
  try {
    ;[viewCounts, commentCounts] = await Promise.all([
      getViewCounts(slugsForQuery, locale),
      getCommentCounts(slugsForQuery),
    ])
  } catch (error) {
    console.warn('Failed to load interaction metrics, fallback to zero:', error)
  }

  return composePostsWithMetrics(posts, viewCounts, commentCounts)
}
