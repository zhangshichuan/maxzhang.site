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
    <span className="stat-pill">
      <MessageCircle className="size-3.5 text-primary" />
      <span>{comments}</span>
    </span>
  )
}
