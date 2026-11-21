'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/src/i18n/client'
import { THEME_STORAGE_KEY, type Theme, resolveInitialTheme } from './theme'

/**
 * Day / Night control. Visible label is the destination mode; aria-pressed
 * reflects whether light mode is currently active.
 */
export function ThemeToggle() {
  const locale = useLocale()
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const current = document.documentElement.dataset.theme
    setTheme(resolveInitialTheme(current ?? null))
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = next
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable in private contexts; the session still works.
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'light' ? '#fafcfb' : '#0a0e11')
    setTheme(next)
  }

  const isLight = theme === 'light'
  const label = isLight ? (locale === 'zh' ? '夜间' : 'Night') : locale === 'zh' ? '日间' : 'Day'
  const ariaLabel = isLight
    ? locale === 'zh'
      ? '切换到深色模式'
      : 'Switch to dark mode'
    : locale === 'zh'
      ? '切换到浅色模式'
      : 'Switch to light mode'

  return (
    <button type="button" className="ni-theme" onClick={toggle} aria-pressed={isLight} aria-label={ariaLabel}>
      <span className="ni-theme-dot" aria-hidden="true" />
      <span className="ni-theme-label">{label}</span>
    </button>
  )
}
