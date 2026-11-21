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
      <div className="ni-page">
        <div className="ni-status">
          <span className="ni-status-count">
            <b>●</b> {t('checking')}
          </span>
        </div>
      </div>
    )
  }

  const totalPhotos = works.reduce((sum, work) => sum + work.photoCount, 0)
  const latest = works[0]

  return (
    <div className="ni-page">
      <header className="ni-page-head">
        <p className="ni-kicker ni-mono ni-page-kicker">
          {locale === 'zh' ? '私有 006 / 照片索引' : 'Private 006 / Photo index'}
        </p>
        <div className="ni-admin-head" style={{ borderBottom: 0, paddingBottom: 0 }}>
          <div>
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
          </div>
          <button type="button" className="ni-btn" onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            {t('upload')}
          </button>
        </div>
      </header>

      <section className="ni-metrics" aria-label={t('title')}>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Works</span>
            <i aria-hidden="true">01</i>
          </div>
          <span className="ni-metric-value">{pad(works.length)}</span>
          <span className="ni-metric-note">Indexed sets</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Storage</span>
            <i aria-hidden="true">02</i>
          </div>
          <span className="ni-metric-value">
            {pad(totalPhotos)}
            <small>files</small>
          </span>
          <span className="ni-metric-note">Published frames</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Latest</span>
            <i aria-hidden="true">03</i>
          </div>
          <span className="ni-metric-value ni-metric-value--date">
            {latest ? formatDate(latest.takenAt, locale) : '—'}
          </span>
          <span className="ni-metric-note">Most recent upload</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Session</span>
            <i aria-hidden="true">04</i>
          </div>
          <span className="ni-metric-value ni-metric-value--date">Admin</span>
          <span className="ni-metric-note">Authenticated</span>
        </div>
      </section>

      <section className="ni-section" aria-labelledby="ni-admin-index">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">01</span>
          <h2 id="ni-admin-index">Works</h2>
          <span className="ni-section-link" aria-hidden="true">
            {pad(works.length)} Records
          </span>
        </header>

        {works.length === 0 ? (
          <div className="ni-empty" style={{ marginTop: 20 }}>
            <span className="ni-empty-code">000 / No records</span>
            <p className="ni-empty-title">{t('empty')}</p>
          </div>
        ) : (
          <div className="ni-admin-table">
            <div className="ni-admin-thead" aria-hidden="true">
              <span>No.</span>
              <span>Cover</span>
              <span>Caption</span>
              <span>Date / Photos</span>
              <span />
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {works.map((work, index) => (
                <li className="ni-admin-row" key={work.slug}>
                  <span className="ni-entry-index ni-mono">{pad(index + 1)}</span>
                  <span>
                    {work.thumbUrl && <img className="ni-admin-thumb" src={work.thumbUrl} alt="" loading="lazy" />}
                  </span>
                  <div>
                    <p className="ni-admin-caption">{work.caption}</p>
                    <p className="ni-admin-sub">{[work.location, ...work.tags].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="ni-admin-meta">
                    <span>{formatDate(work.takenAt, locale)}</span>
                    <br />
                    {t('photosCount', { count: work.photoCount })}
                  </div>
                  <button
                    type="button"
                    className="ni-admin-delete"
                    onClick={() => remove(work.slug)}
                    disabled={deleting === work.slug}
                    aria-label={t('delete')}
                  >
                    {deleting === work.slug ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

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
