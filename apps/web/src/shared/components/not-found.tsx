'use client'

import { Link, useTranslations } from '@/src/i18n/client'

/**
 * 全局 404 页面
 *
 * 纸面风：404 + 一句解释 + 明确出口。
 */
export function NotFoundPage() {
  const t = useTranslations('Common.notFound')

  return (
    <div className="flow-error">
      <p className="flow-error-kicker">404 / NOT FOUND</p>
      <p className="flow-error-code" aria-hidden="true">
        404
      </p>
      <h1 className="flow-error-title">{t('title')}</h1>
      <p className="flow-error-desc">{t('description')}</p>
      <Link href="/" className="btn btn-solid">
        {t('backHome')} <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
