'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from '@/src/i18n/client'
import { THEME_STORAGE_KEY, type Theme, applyTheme, resolveInitialTheme } from './theme'

/**
 * Two-position Day/Night control. Sun selects light, Moon selects dark.
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
      ? { group: '主题', light: '浅色模式', dark: '深色模式' }
      : { group: 'Theme', light: 'Light mode', dark: 'Dark mode' }

  return (
    <div className="ni-theme-group" role="group" aria-label={labels.group}>
      <button
        type="button"
        className="ni-theme-option"
        aria-pressed={theme === 'light'}
        aria-label={labels.light}
        title={labels.light}
        onClick={() => choose('light')}
      >
        <Sun size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="ni-theme-option"
        aria-pressed={theme === 'dark'}
        aria-label={labels.dark}
        title={labels.dark}
        onClick={() => choose('dark')}
      >
        <Moon size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
