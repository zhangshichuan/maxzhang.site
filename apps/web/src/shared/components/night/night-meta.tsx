'use client'

import { useLocale } from '@/src/i18n/client'
import { ThemeToggle } from './theme-toggle'

const copy = {
  en: {
    path: 'Portfolio / 2026 / System nominal',
    status: 'Available for select projects',
  },
  zh: {
    path: '作品集 / 2026 / 系统正常',
    status: '可接受少量合作',
  },
} as const

export function NightMeta() {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']

  return (
    <div className="ni-meta ni-mono">
      <span className="ni-meta-path">
        <b aria-hidden="true">●</b>
        {t.path}
      </span>
      <div className="ni-meta-actions">
        <span className="ni-system">{t.status}</span>
        <ThemeToggle />
      </div>
    </div>
  )
}
