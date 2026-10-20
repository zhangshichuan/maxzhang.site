import '@/src/styles/paper-photos.css'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Comment } from '@/src/features/engagement/components'
import type { PhotoWorkDetail } from '@/src/features/photos/model'
import { getPhotoWorkFn } from '@/src/features/photos/server-functions'
import { useTranslations } from '@/src/i18n/client'
import { cn } from '@/src/shared/utils'
import type { Locale } from '@/i18n/routing'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface PhotoLightboxProps {
  slug: string | null
  locale: Locale
  onClose: () => void
}

const dialogTransition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }

/**
 * 照片弹窗：暗房式「左图右栏」。
 *
 * 列表即入口、弹窗即详情：桌面端左图右栏，移动端全屏（上片下文）。
 * 支持 ESC 关闭、← → 切换、触屏左右滑动切换、下滑关闭；EXIF 折叠展示，评论复用 Comment 组件。
 */
export function PhotoLightbox({ slug, locale, onClose }: PhotoLightboxProps) {
  const t = useTranslations('PhotoDetail')
  const [work, setWork] = useState<PhotoWorkDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [index, setIndex] = useState(0)
  const [fullImage, setFullImage] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [portalReady, setPortalReady] = useState(false)

  // Portal into <body> so the modal escapes .site-shell's stacking context.
  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setWork(null)
    setLoading(true)
    setError(false)
    setIndex(0)
    setFullImage(false)
    getPhotoWorkFn({ data: { slug, locale } })
      .then((data) => {
        if (cancelled) return
        setWork(data)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, locale])

  useEffect(() => {
    if (!slug) return
    previousFocus.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      previousFocus.current?.focus()
    }
  }, [slug])

  const count = work?.photos.length ?? 1

  useEffect(() => {
    setFullImage(false)
  }, [slug, index])

  useEffect(() => {
    if (!slug) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') {
        setIndex((current) => (current - 1 + count) % count)
      } else if (event.key === 'ArrowRight') {
        setIndex((current) => (current + 1) % count)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [slug, onClose, count])

  const photo = work?.photos[Math.min(index, count - 1)]

  const params = work
    ? (
        [
          [t('camera'), work.photos[0]?.camera],
          [t('lens'), work.photos[0]?.lens],
          [t('focal'), work.photos[0]?.focal],
          [t('aperture'), work.photos[0]?.aperture],
          [t('shutter'), work.photos[0]?.shutter],
          [t('iso'), work.photos[0]?.iso],
        ] as const
      ).filter(([, value]) => Boolean(value))
    : []

  const content = (
    <AnimatePresence>
      {slug && (
        <motion.div
          key="backdrop"
          className="ph-lb-backdrop ph-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {slug && (
        <motion.button
          key="close"
          ref={closeRef}
          type="button"
          className="ph-lb-close ph-surface"
          aria-label={t('close')}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <X className="size-4" />
        </motion.button>
      )}

      {slug && (
        <motion.div
          key="dialog"
          role="dialog"
          aria-modal="true"
          aria-label={work?.caption ?? t('loading')}
          className="ph-lightbox ph-surface"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          transition={dialogTransition}
        >
          <div
            className={cn('ph-lb-stage', fullImage && 'is-full')}
            onTouchStart={(event) => {
              const touch = event.touches[0]
              if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY }
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current
              touchStart.current = null
              const touch = event.changedTouches[0]
              if (!start || !touch) return
              const deltaX = touch.clientX - start.x
              const deltaY = touch.clientY - start.y
              if (Math.abs(deltaY) > 88 && Math.abs(deltaY) > Math.abs(deltaX) * 1.25) {
                onClose()
                return
              }
              if (Math.abs(deltaX) > 42) {
                setIndex((current) => (deltaX < 0 ? (current + 1) % count : (current - 1 + count) % count))
              }
            }}
          >
            {loading && (
              <div className="ph-lb-status">
                <Loader2 className="size-5 animate-spin" />
                <span>{t('loading')}</span>
              </div>
            )}
            {!loading && error && <div className="ph-lb-status">{t('error')}</div>}
            {!loading && !error && work && photo && (
              <motion.img
                key={`${work.slug}-${index}`}
                className="ph-lb-image"
                src={photo.largeUrl}
                alt={work.caption}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.32 }}
                draggable={false}
              />
            )}

            {work && count > 1 && (
              <>
                <button
                  type="button"
                  className="ph-lb-nav ph-lb-nav--prev"
                  aria-label={t('prev')}
                  onClick={() => setIndex((current) => (current - 1 + count) % count)}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  className="ph-lb-nav ph-lb-nav--next"
                  aria-label={t('next')}
                  onClick={() => setIndex((current) => (current + 1) % count)}
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {!loading && !error && work && (
              <div className="ph-lb-stagebar">
                <span className="ph-lb-count">
                  {pad(index + 1)} / {pad(count)}
                </span>
                <div className="ph-lb-dots">
                  {count > 1 &&
                    work.photos.map((item, photoIndex) => (
                      <button
                        key={item.largeUrl}
                        type="button"
                        className={cn('ph-lb-dot', photoIndex === index && 'is-active')}
                        aria-label={`${photoIndex + 1}`}
                        onClick={() => setIndex(photoIndex)}
                      />
                    ))}
                </div>
                <button type="button" className="ph-lb-expand" onClick={() => setFullImage((current) => !current)}>
                  {fullImage ? t('collapse') : t('viewFull')}
                </button>
              </div>
            )}
          </div>

          <aside className="ph-lb-rail">
            {loading && <div className="ph-lb-rail-loading">{t('loading')}</div>}
            {!loading && error && <div className="ph-lb-rail-loading">{t('error')}</div>}
            {!loading && !error && work && (
              <>
                <div className="ph-lb-rail-head">
                  <p className="ph-label">Work — {pad(index + 1)}</p>
                  <h2 className="ph-lb-title">{work.caption}</h2>
                </div>

                <div className="ph-lb-meta">
                  <div className="ph-lb-meta-row">
                    <span className="ph-lb-meta-label">Date</span>
                    <span className="ph-lb-meta-value">{formatDate(work.takenAt, locale)}</span>
                  </div>
                  {work.location && (
                    <div className="ph-lb-meta-row">
                      <span className="ph-lb-meta-label">Place</span>
                      <span className="ph-lb-meta-value">{work.location}</span>
                    </div>
                  )}
                  <div className="ph-lb-meta-row">
                    <span className="ph-lb-meta-label">Frames</span>
                    <span className="ph-lb-meta-value">
                      {pad(index + 1)} / {pad(count)}
                    </span>
                  </div>
                </div>

                {work.tags.length > 0 && (
                  <div className="ph-lb-tags">
                    {work.tags.map((tag) => (
                      <span className="ph-lb-tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {params.length > 0 && (
                  <details className="ph-lb-exif">
                    <summary>{t('exif')}</summary>
                    {params.map(([label, value]) => (
                      <div key={label} className="ph-lb-exif-row">
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                    ))}
                  </details>
                )}

                <div className="ph-lb-comments">
                  <Comment slug={work.slug} locale={locale} />
                </div>

                <p className="ph-lb-gesture">Swipe ← → · Down to close</p>
                <p className="ph-lb-share">
                  <span>{t('shortcuts')}</span>
                  <span>
                    {t('share')} · #photo/{work.slug}
                  </span>
                </p>
              </>
            )}
          </aside>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (!portalReady) return null
  return createPortal(content, document.body)
}
