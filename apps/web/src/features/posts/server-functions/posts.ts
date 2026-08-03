import { createServerFn } from '@tanstack/react-start'
import { getAllPostsWithViews } from '@/src/features/posts/queries/posts.server'
import { loadPostPage } from '@/src/features/posts/queries/post-page.server'

/**
 * 文章数据 Server Functions
 *
 * 路由 loader 只允许调这里的函数：客户端 bundle 里它们会被编译成 RPC 存根，
 * 真正读文件系统/数据库的 queries 永远不会进浏览器（否则 fs/path/prisma 会在客户端炸掉）。
 */
export const getAllPostsWithViewsFn = createServerFn({ method: 'GET' })
  .validator((data: { locale: string }) => data)
  .handler(async ({ data }) => getAllPostsWithViews(data.locale))

export const loadPostPageFn = createServerFn({ method: 'GET' })
  .validator((data: { slug: string; locale: string }) => data)
  .handler(async ({ data }) => loadPostPage(data.slug, data.locale))

export const loadPostsIndexFn = createServerFn({ method: 'GET' })
  .validator((data: { locale: string }) => data)
  .handler(async ({ data }) => {
    const posts = await getAllPostsWithViews(data.locale)
    return {
      posts,
      allTags: Array.from(new Set(posts.flatMap((post) => post.tags))),
      allCategories: Array.from(new Set(posts.map((post) => post.category).filter(Boolean))),
    }
  })
