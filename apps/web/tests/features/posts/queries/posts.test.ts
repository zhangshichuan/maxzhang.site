import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/features/engagement/queries', () => ({
  getCommentCounts: vi.fn(async () => ({})),
  getViewCounts: vi.fn(async () => ({})),
}))

vi.mock('@/i18n/routing', () => ({
  routing: {
    defaultLocale: 'en',
  },
}))

const fixtureMdx = `---
title: 'Test Post'
date: '2026-01-01'
summary: 'Test summary'
tags: ['test']
category: 'Frontend'
author: 'Max Zhang'
---

# Hello

Some content.
`

describe('文章查询', () => {
  let tmpDir: string

  beforeEach(() => {
    vi.resetModules()

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-test-'))
    fs.mkdirSync(path.join(tmpDir, 'articles', 'en'), { recursive: true })
    fs.mkdirSync(path.join(tmpDir, 'articles', 'zh'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'articles', 'en', 'hello-world.mdx'), fixtureMdx)
    fs.writeFileSync(path.join(tmpDir, 'articles', 'zh', 'ni-hao.mdx'), fixtureMdx)

    // posts.server.ts 在模块加载时用 process.cwd() 定位 articles 目录，
    // 每次动态 import 前把 cwd 指向临时目录，保证测试不依赖仓库内的真实文章。
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fs.rmSync(tmpDir, { recursive: true, force: true })
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
