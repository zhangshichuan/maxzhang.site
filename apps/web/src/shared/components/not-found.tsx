'use client'

import { Link, useLocale, useTranslations } from '@/src/i18n/client'

/**
 * 全局 404 页面
 *
 * Night Instrument：大号 404 + 一句解释 + 明确出口。
 */
export function NotFoundPage() {
  const t = useTranslations('Common.notFound')
  const locale = useLocale()

  return (
    <div className="ni-page">
      <div className="ni-404">
        <p className="ni-kicker ni-mono">{locale === 'zh' ? '404 / 未找到' : '404 / Not found'}</p>
        <p className="ni-404-code" aria-hidden="true">
          404
        </p>
        <h1>{t('title')}</h1>
        <p className="ni-404-desc">{t('description')}</p>
        <Link href="/" className="ni-btn">
          {t('backHome')} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  )
}
