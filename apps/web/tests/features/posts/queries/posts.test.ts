import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/features/engagement/queries', () => ({
  getCommentCounts: vi.fn(async () => ({})),
  getViewCounts: vi.fn(async () => ({})),
}))

vi.mock('@/i18n/routing', () => ({
  routing: {
    defaultLocale: 'en',
  },
}))

describe('文章查询', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('会读取对应语言的文章 slug 列表', async () => {
    const { getPostSlugs } = await import('@/src/features/posts/queries')

    const slugs = getPostSlugs('en')

    expect(slugs.length).toBeGreaterThan(0)
    expect(slugs.every((slug) => slug.endsWith('.md') || slug.endsWith('.mdx'))).toBe(true)
  })

  it('会在 includeContent 为 false 时返回不含正文的文章元数据', async () => {
    const { getPostBySlug, getPostSlugs } = await import('@/src/features/posts/queries')

    const slug = getPostSlugs('en')[0]
    const post = getPostBySlug(slug, 'en', false)

    expect(post.slug).toBe(slug.replace(/\.mdx?$/, ''))
    expect(post.title).toBeTruthy()
    expect(post.summary).toBeTypeOf('string')
    expect('content' in post).toBe(false)
  })

  it('会在加载文章时解码 URL 编码的 slug', async () => {
    const { getPostBySlug, getPostSlugs } = await import('@/src/features/posts/queries')

    const slug = getPostSlugs('zh')[0].replace(/\.mdx?$/, '')
    const encodedSlug = encodeURIComponent(slug)

    const post = getPostBySlug(encodedSlug, 'zh')

    expect(post.slug).toBe(slug)
    expect(post.content.length).toBeGreaterThan(0)
  })
})
