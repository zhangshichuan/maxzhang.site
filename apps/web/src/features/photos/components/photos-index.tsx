import { Camera, MessageCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from '@/src/i18n/client'
import type { PhotoWorkSummary } from '@/src/features/photos/model'
import { parsePhotoHash, photoHash } from '@/src/features/photos/model/photo-hash'
import { PhotoLightbox } from './photo-lightbox'

interface PhotosIndexProps {
  works: PhotoWorkSummary[]
}

function formatMonthYear(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
  })
}

/**
 * 摄影画廊列表：统一 4:5 网格 + Instagram 式弹窗。
 *
 * 弹窗状态与 `#photo/<slug>` 深链同步：打开写 hash、浏览器后退关闭、
 * 直接访问带 hash 的链接会自动打开对应作品。
 */
export function PhotosIndex({ works }: PhotosIndexProps) {
  const t = useTranslations('PhotosPage')
  const locale = useLocale()
  const [activeSlug, setActiveSlug] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : parsePhotoHash(window.location.hash),
  )

  useEffect(() => {
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

  return (
    <div>
      <div className="photos-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('description')}</p>
        </div>
      </div>

      {works.length === 0 ? (
        <div className="empty-state">{t('empty')}</div>
      ) : (
        <div className="photo-grid">
          {works.map((work) => (
            <button
              key={work.slug}
              type="button"
              className="photo-tile"
              aria-label={work.caption}
              onClick={() => open(work.slug)}
            >
              <img src={work.thumbUrl} alt={work.caption} loading="lazy" />
              {work.photoCount > 1 && (
                <span className="photo-count-badge">
                  <Camera className="size-3" />
                  {work.photoCount}
                </span>
              )}
              <span className="photo-tile-veil">
                <span className="photo-tile-caption">{work.caption}</span>
                <span className="photo-tile-meta">
                  {formatMonthYear(work.takenAt, locale)}
                  {work.location ? ` · ${work.location}` : ''}
                </span>
              </span>
              <span className="photo-tile-body">
                <span className="photo-tile-caption">{work.caption}</span>
                <span className="photo-tile-footer">
                  <span className="photo-tile-avatar">M</span>
                  <span className="photo-tile-author">{t('author')}</span>
                  <span className="photo-tile-comments">
                    <MessageCircle className="size-3.5" />
                    {work.commentCount}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <PhotoLightbox slug={activeSlug} locale={locale} onClose={close} />
    </div>
  )
}
