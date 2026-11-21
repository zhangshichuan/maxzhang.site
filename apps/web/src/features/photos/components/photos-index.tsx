import { useCallback, useEffect, useState } from 'react'
import type { PhotoWorkSummary } from '@/src/features/photos/model'
import { parsePhotoHash, photoHash } from '@/src/features/photos/model/photo-hash'
import { useLocale, useTranslations } from '@/src/i18n/client'
import { PhotoLightbox } from './photo-lightbox'

interface PhotosIndexProps {
  works: PhotoWorkSummary[]
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatMonthYear(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
  })
}

function yearRange(works: PhotoWorkSummary[]): string {
  if (works.length === 0) return '—'
  const years = works.map((work) => new Date(work.takenAt).getFullYear())
  const from = Math.min(...years)
  const to = Math.max(...years)
  return from === to ? String(from) : `${from}—${to}`
}

/**
 * 摄影画廊：Night Instrument 档案索引。
 *
 * 弹窗状态与 `#photo/<slug>` 深链同步：打开写 hash、浏览器后退关闭、
 * 直接访问带 hash 的链接会自动打开对应作品。
 */
export function PhotosIndex({ works }: PhotosIndexProps) {
  const t = useTranslations('PhotosPage')
  const locale = useLocale()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  useEffect(() => {
    setActiveSlug(parsePhotoHash(window.location.hash))
    const onHashChange = () => setActiveSlug(parsePhotoHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const open = useCallback((slug: string) => {
    window.history.pushState(null, '', photoHash(slug))
    setActiveSlug(slug)
  }, [])

  const close = useCallback(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    setActiveSlug(null)
  }, [])

  const totalPhotos = works.reduce((sum, work) => sum + work.photoCount, 0)
  const range = yearRange(works)

  return (
    <div className="ni-page">
      <header className="ni-page-head">
        <p className="ni-kicker ni-mono ni-page-kicker">
          {locale === 'zh' ? '档案 003 / 摄影' : 'Archive 003 / Photography'}
        </p>
        <div className="ni-page-head-grid">
          <h1 className="ni-page-title">{t('title')}</h1>
          <div className="ni-page-aside">
            <p className="ni-page-desc">{t('description')}</p>
            <p className="ni-page-note">
              {pad(works.length)} Works — {pad(totalPhotos)} Frames
            </p>
          </div>
        </div>
      </header>

      <section className="ni-metrics" aria-label={t('title')}>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Works</span>
            <i aria-hidden="true">01</i>
          </div>
          <span className="ni-metric-value">{pad(works.length)}</span>
          <span className="ni-metric-note">Curated sets</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Frames</span>
            <i aria-hidden="true">02</i>
          </div>
          <span className="ni-metric-value">{pad(totalPhotos)}</span>
          <span className="ni-metric-note">Published images</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Author</span>
            <i aria-hidden="true">03</i>
          </div>
          <span className="ni-metric-value ni-metric-value--date">{t('author')}</span>
          <span className="ni-metric-note">Shenzhen / Shanghai</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>Year</span>
            <i aria-hidden="true">04</i>
          </div>
          <span className="ni-metric-value ni-metric-value--date">{range}</span>
          <span className="ni-metric-note">Archive range</span>
        </div>
      </section>

      {works.length === 0 ? (
        <section className="ni-section" aria-label={t('title')}>
          <div className="ni-empty">
            <span className="ni-empty-code">000 / Archive empty</span>
            <p className="ni-empty-title">{t('empty')}</p>
            <p className="ni-empty-text">{t('author')} · Shenzhen / Shanghai</p>
          </div>
        </section>
      ) : (
        <section className="ni-section" aria-labelledby="ni-archive-index">
          <header className="ni-section-head">
            <span className="ni-index ni-mono">01</span>
            <h2 id="ni-archive-index">Index</h2>
            <span className="ni-section-link" aria-hidden="true">
              {pad(works.length)} Works — {pad(totalPhotos)} Frames
            </span>
          </header>

          <div className="ni-archive-grid">
            {works.map((work, index) => (
              <button
                type="button"
                className="ni-work"
                key={work.slug}
                aria-label={`${work.caption} — ${formatMonthYear(work.takenAt, locale)}`}
                onClick={() => open(work.slug)}
              >
                <span className="ni-work-frame">
                  <img src={work.thumbUrl} alt={work.caption} loading="lazy" decoding="async" />
                  <span className="ni-work-index ni-mono" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  {work.photoCount > 1 && (
                    <span className="ni-work-badge ni-mono" aria-hidden="true">
                      {pad(work.photoCount)} Frames
                    </span>
                  )}
                </span>
                <span className="ni-work-caption">{work.caption}</span>
                <span className="ni-work-meta">
                  <span>{formatMonthYear(work.takenAt, locale)}</span>
                  {work.location && <span>{work.location}</span>}
                </span>
                <span className="ni-work-tags">
                  {work.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                  <span style={{ marginLeft: 'auto' }}>{pad(work.commentCount)} Comments</span>
                </span>
              </button>
            ))}
          </div>

          <div className="ni-status" style={{ marginTop: 20 }}>
            <span className="ni-status-count">{t('author')} — Photography</span>
            <span className="ni-status-count">{range} · Archive</span>
          </div>
        </section>
      )}

      <PhotoLightbox slug={activeSlug} locale={locale} onClose={close} />
    </div>
  )
}
