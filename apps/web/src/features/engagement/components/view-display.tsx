'use client'

import { Eye } from 'lucide-react'

/**
 * 阅读数展示组件
 * 纯展示组件，用于文章列表页。
 * 阅读数通过 getAllPostsWithViews 一次性获取，不再单独查询。
 */
interface ViewDisplayProps {
  views: number
}

export function ViewDisplay({ views }: ViewDisplayProps) {
  return (
    <span className="stat-pill">
      <Eye className="size-3.5 text-primary" />
      <span>{views}</span>
    </span>
  )
}
