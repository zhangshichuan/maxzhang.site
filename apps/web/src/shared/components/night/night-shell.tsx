'use client'

import { useEffect, type ReactNode } from 'react'
import { useLocale } from '@/src/i18n/client'
import { cn } from '@/src/shared/utils/cn'
import { NightFooter } from './night-footer'
import { NightMeta } from './night-meta'
import { NightRail } from './night-rail'

const skipLabel = {
  en: 'Skip to content',
  zh: '跳到正文',
} as const

type ShellVariant = 'page' | 'chat' | 'auth'

/**
 * Night Instrument page frame: fixed rail, meta row, content column.
 * Every page renders inside this shell; the old navbar/footer are retired.
 */
export function NightShell({ children, variant = 'page' }: { children: ReactNode; variant?: ShellVariant }) {
  const locale = useLocale()

  useEffect(() => {
    const rail = document.querySelector<HTMLElement>('.ni-rail')
    if (!rail) return
    const root = document.documentElement
    const update = () => {
      if (window.matchMedia('(max-width: 1120px)').matches) {
        root.style.setProperty('--ni-rail-height', `${rail.offsetHeight}px`)
      } else {
        root.style.removeProperty('--ni-rail-height')
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(rail)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty('--ni-rail-height')
    }
  }, [])

  return (
    <>
      <a className="ni-skip" href="#ni-content">
        {skipLabel[locale]}
      </a>
      <div className="ni-shell">
        <NightRail />
        <main className={cn('ni-main', variant === 'chat' && 'ni-main--chat')} id="ni-content" tabIndex={-1}>
          <div
            className={cn('ni-inner', variant === 'chat' && 'ni-inner--chat', variant === 'auth' && 'ni-inner--auth')}
          >
            <NightMeta />
            {children}
            {variant === 'page' ? <NightFooter /> : null}
          </div>
        </main>
      </div>
    </>
  )
}
