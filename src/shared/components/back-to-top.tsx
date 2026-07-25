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
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 50,
        background: 'var(--card)',
        border: '1px solid rgba(255,255,255,.06)',
        color: 'rgba(255,255,255,.4)',
        padding: 10,
        cursor: 'pointer',
        transition: 'all .25s',
        clipPath: 'polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
      }}
      onMouseEnter={(e) => {
        ;(e.target as HTMLElement).style.color = 'var(--neon)'
        ;(e.target as HTMLElement).style.borderColor = 'rgba(255,45,149,.3)'
      }}
      onMouseLeave={(e) => {
        ;(e.target as HTMLElement).style.color = 'rgba(255,255,255,.4)'
        ;(e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,.06)'
      }}
    >
      <ArrowUp style={{ width: 16, height: 16 }} />
    </button>
  )
}
