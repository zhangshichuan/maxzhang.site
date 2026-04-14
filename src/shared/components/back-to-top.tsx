/**
 * 返回顶部按钮组件
 *
 * 当页面滚动超过一定距离时显示，点击后平滑滚动到页面顶部
 */

'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * 返回顶部按钮组件
 *
 * @returns 根据滚动位置显示/隐藏的返回顶部按钮
 */
export function BackToTop() {
  // 控制按钮可见性状态
  const [isVisible, setIsVisible] = useState(false)

  // 监听滚动事件，控制按钮显示/隐藏
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400) // 滚动超过400px时显示按钮
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  // 平滑滚动到页面顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="
			fixed
				right-8 bottom-8 z-50 cursor-pointer
				rounded-full bg-primary p-3
				text-primary-foreground shadow-lg
				transition-all hover:scale-110 hover:bg-primary/90
				active:scale-95
			"
    >
      <ArrowUp className="size-6" />
    </button>
  )
}
