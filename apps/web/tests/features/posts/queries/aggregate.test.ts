import { describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/routing', () => ({
  routing: {
    defaultLocale: 'en',
  },
}))

import { composePostsWithMetrics } from '@/src/features/posts/queries'

describe('文章指标聚合', () => {
  it('会按日期降序排序并按 slug 合并指标', () => {
    const posts = [
      {
        slug: 'older',
        title: 'Older',
        date: '2024-01-01',
        summary: 'old',
        readTime: { text: '1 min read', minutes: 1, time: 60000, words: 200 },
        tags: ['a'],
        author: 'Max',
        category: 'Cat A',
      },
      {
        slug: 'newer',
        title: 'Newer',
        date: '2024-06-01',
        summary: 'new',
        readTime: { text: '2 min read', minutes: 2, time: 120000, words: 400 },
        tags: ['b'],
        author: 'Max',
        category: 'Cat B',
      },
    ]

    const result = composePostsWithMetrics(posts, { newer: 12 }, { older: 3 })

    expect(result.map((post) => post.slug)).toEqual(['newer', 'older'])
    expect(result[0].views).toBe(12)
    expect(result[0].comments).toBe(0)
    expect(result[1].views).toBe(0)
    expect(result[1].comments).toBe(3)
  })
})
