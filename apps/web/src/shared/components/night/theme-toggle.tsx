'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from '@/src/i18n/client'
import { THEME_STORAGE_KEY, type Theme, applyTheme, resolveInitialTheme } from './theme'

/**
 * Single Day/Night toggle, sized and styled like the locale switch.
 * The icon shows the destination: Moon in light mode, Sun in dark mode.
 * Until the visitor chooses explicitly we follow prefers-color-scheme and
 * keep following live system changes.
 */
export function ThemeToggle() {
  const locale = useLocale()
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(resolveInitialTheme(document.documentElement.dataset.theme ?? null))
  }, [])

  // Two instances can be mounted (desktop rail + mobile bar); keep them in sync.
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme(root.dataset.theme === 'light' ? 'light' : 'dark')
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onSystemChange = () => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return
      } catch {
        // Storage unavailable: keep following the system.
      }
      applyTheme(media.matches ? 'light' : 'dark')
    }
    media.addEventListener('change', onSystemChange)
    return () => media.removeEventListener('change', onSystemChange)
  }, [])

  const choose = (next: Theme) => {
    applyTheme(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable in private contexts; the session still works.
    }
  }

  const labels =
    locale === 'zh'
      ? { toLight: '切换到浅色模式', toDark: '切换到深色模式' }
      : { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' }

  const next: Theme = theme === 'light' ? 'dark' : 'light'
  const label = next === 'light' ? labels.toLight : labels.toDark

  return (
    <button
      type="button"
      className="ni-locale ni-theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => choose(next)}
    >
      {next === 'light' ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
    </button>
  )
}
