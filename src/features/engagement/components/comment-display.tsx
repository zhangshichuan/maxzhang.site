'use client'

import { MessageCircle } from 'lucide-react'

/**
 * 评论数展示组件
 * 纯展示组件，用于文章列表页。
 * 评论数通过 getAllPostsWithViews 一次性获取，不再单独查询。
 */
interface CommentDisplayProps {
  comments: number
}

export function CommentDisplay({ comments }: CommentDisplayProps) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-border/5 bg-muted px-2 py-1">
      <MessageCircle className="size-4 text-primary" />
      <span>{comments}</span>
    </span>
  )
}
