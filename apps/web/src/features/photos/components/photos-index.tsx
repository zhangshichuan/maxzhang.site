import '@/src/styles/paper-photos.css'

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
 * 摄影画廊：暗色档案式索引。
 *
 * 弹窗状态与 `#photo/<slug>` 深链同步：打开写 hash、浏览器后退关闭、
 * 直接访问带 hash 的链接会自动打开对应作品。
 */
export function PhotosIndex({ works }: PhotosIndexProps) {
  const t = useTranslations('PhotosPage')
  const locale = useLocale()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  // 深链（#photo/<slug>）只在客户端读取，避免 SSR 与客户端首帧不一致
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
    <div className="ph-page">
      <header className="ph-masthead">
        <div className="ph-kicker">
          <span className="ph-kicker-main">
            <span className="ph-dot" aria-hidden="true" />
            Photography / 摄影
          </span>
          <span className="ph-kicker-meta">Archive — {range}</span>
        </div>

        <div className="ph-masthead-row">
          <h1 className="ph-title">{t('title')}</h1>
          <div className="ph-masthead-side">
            <p className="ph-lede">{t('description')}</p>
            <dl className="ph-facts">
              <div>
                <dt>Works</dt>
                <dd>{pad(works.length)}</dd>
              </div>
              <div>
                <dt>Frames</dt>
                <dd>{pad(totalPhotos)}</dd>
              </div>
              <div>
                <dt>Author</dt>
                <dd>{t('author')}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{range}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="ph-rule" aria-hidden="true">
          <span className="ph-rule-tick" />
        </div>
      </header>

      {works.length === 0 ? (
        <section className="ph-empty" aria-label={t('title')}>
          <span className="ph-empty-code" aria-hidden="true">
            00
          </span>
          <div className="ph-empty-copy">
            <p className="ph-label">Archive — Empty</p>
            <p className="ph-empty-text">{t('empty')}</p>
            <p className="ph-empty-hint">{t('author')} · Chengdu / Remote</p>
          </div>
          <div className="ph-empty-frame" aria-hidden="true" />
        </section>
      ) : (
        <>
          <div className="ph-section-head">
            <p className="ph-label">Index</p>
            <p className="ph-section-meta">
              {pad(works.length)} Works — {pad(totalPhotos)} Frames
            </p>
          </div>

          <section className="ph-grid" aria-label={t('title')}>
            {works.map((work, index) => (
              <article className="ph-tile" key={work.slug}>
                <button
                  type="button"
                  className="ph-tile-btn"
                  aria-label={`${work.caption} — ${formatMonthYear(work.takenAt, locale)}`}
                  onClick={() => open(work.slug)}
                >
                  <span className="ph-frame">
                    <img src={work.thumbUrl} alt={work.caption} loading="lazy" decoding="async" />
                    <span className="ph-tile-index" aria-hidden="true">
                      {pad(index + 1)}
                    </span>
                    {work.photoCount > 1 && (
                      <span className="ph-tile-badge" aria-hidden="true">
                        {pad(work.photoCount)} Frames
                      </span>
                    )}
                    <span className="ph-tile-open" aria-hidden="true">
                      Open ↗
                    </span>
                  </span>
                  <span className="ph-tile-caption">{work.caption}</span>
                  <span className="ph-tile-meta">
                    <span>{formatMonthYear(work.takenAt, locale)}</span>
                    {work.location && <span className="ph-tile-loc">{work.location}</span>}
                  </span>
                  <span className="ph-tile-foot">
                    <span className="ph-tile-tags">
                      {work.tags.slice(0, 3).map((tag) => (
                        <span className="ph-tile-tag" key={tag}>
                          #{tag}
                        </span>
                      ))}
                    </span>
                    <span className="ph-tile-comments">{pad(work.commentCount)} Comments</span>
                  </span>
                </button>
              </article>
            ))}
          </section>

          <div className="ph-index-foot">
            <span>{t('author')} — Photography</span>
            <span>{range} · Archive</span>
          </div>
        </>
      )}

      <PhotoLightbox slug={activeSlug} locale={locale} onClose={close} />
    </div>
  )
}
