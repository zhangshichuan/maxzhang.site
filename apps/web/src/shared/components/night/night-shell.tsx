'use client'

import type { ReactNode } from 'react'
import { useLocale } from '@/src/i18n/client'
import { NightMeta } from './night-meta'
import { NightRail } from './night-rail'

const skipLabel = {
  en: 'Skip to content',
  zh: '跳到正文',
} as const

/**
 * Night Instrument page frame: sticky rail, meta row, and the main column.
 * Used by the homepage first; inner pages keep the old chrome until migrated.
 */
export function NightShell({ children }: { children: ReactNode }) {
  const locale = useLocale()

  return (
    <>
      <a className="ni-skip" href="#ni-content">
        {skipLabel[locale]}
      </a>
      <div className="ni-shell">
        <NightRail />
        <main className="ni-main" id="ni-content" tabIndex={-1}>
          <div className="ni-inner">
            <NightMeta />
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
