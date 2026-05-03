/**
 * 返回顶部按钮组件
 *
 * 杂志风格 — 低调优雅
 */

'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed right-6 bottom-6 z-50 cursor-pointer rounded-sm border border-border/40 bg-card p-2.5 text-muted-foreground shadow-(--shadow-card) transition-all hover:border-primary/30 hover:text-primary active:scale-95"
    >
      <ArrowUp className="size-4" />
    </button>
  )
}
