import '@/src/styles/paper-admin.css'

import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { PhotoWorkSummary } from '@/src/features/photos/model'
import { listPhotoWorksFn } from '@/src/features/photos/server-functions'
import { useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'
import { UploadDialog } from './upload-dialog'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
}

/**
 * 管理后台 — 照片索引表
 *
 * 未登录时自动跳回 /login；已登录展示作品索引、上传入口与删除操作。
 */
export function AdminConsole() {
  const t = useTranslations('AdminConsole')
  const locale = useLocale()
  const [checking, setChecking] = useState(true)
  const [works, setWorks] = useState<PhotoWorkSummary[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    const list = await listPhotoWorksFn({ data: { locale } })
    setWorks(list)
  }, [locale])

  useEffect(() => {
    fetch('/api/photos/status')
      .then((response) => response.json())
      .then((data) => {
        if (!data.admin) {
          window.location.replace(localizePath('/login', locale))
          return
        }
        void load()
      })
      .catch(() => window.location.replace(localizePath('/login', locale)))
      .finally(() => setChecking(false))
  }, [locale, load])

  const remove = async (slug: string) => {
    setDeleting(slug)
    await fetch('/api/photos/delete', {
      method: 'POST',
      headers: { 'x-admin-request': '1', 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
    setDeleting(null)
    void load()
  }

  if (checking) {
    return (
      <div className="ad-page">
        <div className="ad-check">
          <span className="ad-dot" aria-hidden="true" />
          {t('checking')}
        </div>
      </div>
    )
  }

  const totalPhotos = works.reduce((sum, work) => sum + work.photoCount, 0)
  const latest = works[0]

  return (
    <div className="ad-page">
      <header className="ad-console-head">
        <div className="ad-console-intro">
          <p className="ad-kicker">
            <span className="ad-dot" aria-hidden="true" />
            Archive / Photo index
          </p>
          <h1 className="ad-title">{t('title')}</h1>
          <p className="ad-sub">{t('description')}</p>
        </div>

        <button type="button" className="ad-upload-btn" onClick={() => setUploadOpen(true)}>
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
          {t('upload')}
        </button>
      </header>

      <div className="ad-stats">
        <div className="ad-stat">
          <span className="ad-stat-label">Works</span>
          <span className="ad-stat-value">{pad(works.length)}</span>
        </div>
        <div className="ad-stat">
          <span className="ad-stat-label">Storage</span>
          <span className="ad-stat-value">
            {pad(totalPhotos)}
            <span className="ad-stat-unit">Files</span>
          </span>
        </div>
        <div className="ad-stat">
          <span className="ad-stat-label">Latest</span>
          <span className="ad-stat-value">{latest ? formatDate(latest.takenAt, locale) : '—'}</span>
        </div>
        <div className="ad-stat">
          <span className="ad-stat-label">Session</span>
          <span className="ad-stat-value ad-stat-value--session">
            <span className="ad-dot" aria-hidden="true" />
            Admin
          </span>
        </div>
      </div>

      {works.length === 0 ? (
        <div className="ad-empty">
          <p className="ad-empty-kicker">No records / 000</p>
          <p className="ad-empty-title">{t('empty')}</p>
        </div>
      ) : (
        <div className="ad-index">
          <div className="ad-thead" aria-hidden="true">
            <span>No.</span>
            <span>Cover</span>
            <span>Caption</span>
            <span>Date / Photos</span>
            <span />
          </div>
          <ul>
            {works.map((work, index) => (
              <li className="ad-row" key={work.slug}>
                <span className="ad-row-no">{pad(index + 1)}</span>
                <div className="ad-thumb">{work.thumbUrl && <img src={work.thumbUrl} alt="" loading="lazy" />}</div>
                <div className="ad-row-cap">
                  <p className="ad-row-caption">{work.caption}</p>
                  <p className="ad-row-sub">{[work.location, ...work.tags].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="ad-row-meta">
                  <span className="ad-row-date">{formatDate(work.takenAt, locale)}</span>
                  <span className="ad-row-count">{t('photosCount', { count: work.photoCount })}</span>
                </div>
                <button
                  type="button"
                  className="ad-del"
                  onClick={() => remove(work.slug)}
                  disabled={deleting === work.slug}
                  aria-label={t('delete')}
                >
                  {deleting === work.slug ? (
                    <Loader2 className="size-4 ad-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(slug) => {
          window.location.href = localizePath(`/photos#photo/${slug}`, locale)
        }}
      />
    </div>
  )
}
