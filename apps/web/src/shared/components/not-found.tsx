'use client'

import { Link, useTranslations } from '@/src/i18n/client'

/**
 * 全局 404 页面
 *
 * iOS 风格空状态：大号 404 + 说明文案 + 返回首页按钮。
 */
export function NotFoundPage() {
  const t = useTranslations('Common.notFound')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="text-6xl font-extrabold tracking-tighter text-primary">404</p>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="max-w-md text-sm" style={{ color: 'var(--label-secondary)' }}>
        {t('description')}
      </p>
      <Link href="/" className="btn btn-primary mt-4" style={{ padding: '11px 24px', fontSize: 14 }}>
        {t('backHome')}
      </Link>
    </div>
  )
}
