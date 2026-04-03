import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

import { getCommentCounts } from '@/src/features/engagement/queries'
import { getViewCounts } from '@/src/features/engagement/queries'
import type { Post, PostSummary, PostSummaryWithViews } from '@/src/features/posts/model'
import { routing } from '@/i18n/routing'

const postsDirectory = path.join(process.cwd(), 'articles')

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
export function getPostBySlug(
  slug: string,
  locale: string = routing.defaultLocale,
  includeContent: boolean = true,
): Post | PostSummary {
  const realSlug = decodeURIComponent(slug).replace(/\.mdx?$/, '')

  let fullPath = path.join(postsDirectory, locale, `${realSlug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, locale, `${realSlug}.md`)
  }

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
  const [viewCounts, commentCounts] = await Promise.all([
    getViewCounts(slugsForQuery, locale),
    getCommentCounts(slugsForQuery),
  ])

  return composePostsWithMetrics(posts, viewCounts, commentCounts)
}
