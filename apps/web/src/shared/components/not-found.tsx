'use client'

import { Link, useTranslations } from '@/src/i18n/client'

/**
 * 全局 404 页面
 *
 * 控制台语义：command not found + 明确出口。
 */
export function NotFoundPage() {
  const t = useTranslations('Common.notFound')

  return (
    <div className="os-404">
      <div className="os-kicker">~/error</div>
      <p className="os-404-code">404</p>
      <h1 className="os-404-title">{t('title')}</h1>
      <p className="os-404-desc">{t('description')}</p>
      <Link href="/" className="btn btn-primary os-btn">
        {t('backHome')}
      </Link>
    </div>
  )
}
