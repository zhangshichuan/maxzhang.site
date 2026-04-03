import type readingTime from 'reading-time'

export type ReadingTime = ReturnType<typeof readingTime>

export interface Post {
  slug: string
  title: string
  date: string
  summary: string
  content: string
  readTime: ReadingTime
  tags: string[]
  author: string
  category: string
}

export type PostSummary = Omit<Post, 'content'>

export interface PostSummaryWithViews extends PostSummary {
  views: number
  comments: number
}
