import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Loader2, MapPin, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Comment } from '@/src/features/engagement/components'
import type { PhotoWorkDetail } from '@/src/features/photos/model'
import { getPhotoWorkFn } from '@/src/features/photos/server-functions'
import { useTranslations } from '@/src/i18n/client'
import { cn } from '@/src/shared/utils'
import type { Locale } from '@/i18n/routing'

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

/**
 * Instagram 式照片弹窗。
 *
 * 列表即入口、弹窗即详情：桌面端为「左图右栏」，移动端全屏（上片下文）。
 * 支持 ESC 关闭、← → 切换、触屏滑动；EXIF 折叠展示，评论复用 Comment 组件。
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
  const touchX = useRef<number | null>(null)

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
      } else if (event.key === 'ArrowLeft') {
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

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          key="backdrop"
          className="photo-lb-backdrop"
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
          className="photo-lb-close"
          aria-label={t('close')}
          onClick={onClose}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
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
          className="photo-lightbox"
          initial={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.96 }}
          animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
          exit={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.96, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        >
          <div
            className={cn('photo-lb-stage', fullImage && 'photo-lb-stage-full')}
            onTouchStart={(event) => {
              touchX.current = event.touches[0].clientX
            }}
            onTouchEnd={(event) => {
              if (touchX.current === null) return
              const delta = event.changedTouches[0].clientX - touchX.current
              if (Math.abs(delta) > 42) {
                setIndex((current) => (delta < 0 ? (current + 1) % count : (current - 1 + count) % count))
              }
              touchX.current = null
            }}
          >
            {loading && (
              <div className="photo-lb-status">
                <Loader2 className="size-6 animate-spin" />
                <span>{t('loading')}</span>
              </div>
            )}
            {!loading && error && <div className="photo-lb-status">{t('error')}</div>}
            {!loading && !error && work && photo && (
              <motion.img
                key={`${work.slug}-${index}`}
                src={photo.largeUrl}
                alt={work.caption}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            {work && count > 1 && (
              <>
                <button
                  type="button"
                  className="photo-lb-nav-btn photo-lb-nav-prev"
                  aria-label={t('prev')}
                  onClick={() => setIndex((current) => (current - 1 + count) % count)}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  className="photo-lb-nav-btn photo-lb-nav-next"
                  aria-label={t('next')}
                  onClick={() => setIndex((current) => (current + 1) % count)}
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="photo-lb-counter">
                  {index + 1} / {count}
                </div>
                <div className="photo-lb-dots">
                  {work.photos.map((item, photoIndex) => (
                    <button
                      key={item.largeUrl}
                      type="button"
                      className={cn('photo-lb-dot', photoIndex === index && 'active')}
                      aria-label={`${photoIndex + 1}`}
                      onClick={() => setIndex(photoIndex)}
                    />
                  ))}
                </div>
              </>
            )}
            {!loading && !error && work && photo && (
              <button
                type="button"
                className={cn('photo-lb-expand', count > 1 && 'photo-lb-expand-with-dots')}
                onClick={() => setFullImage((current) => !current)}
              >
                {fullImage ? t('collapse') : t('viewFull')}
              </button>
            )}
          </div>

          <div className="photo-lb-rail">
            {loading && <div className="photo-lb-rail-loading">{t('loading')}</div>}
            {!loading && error && <div className="photo-lb-rail-loading">{t('error')}</div>}
            {!loading && !error && work && (
              <>
                <h2 className="photo-lb-cap">{work.caption}</h2>
                <div className="photo-lb-meta">
                  <span className="photo-lb-pill">
                    <Calendar className="size-3.5" />
                    {formatDate(work.takenAt, locale)}
                  </span>
                  {work.location && (
                    <span className="photo-lb-pill">
                      <MapPin className="size-3.5" />
                      {work.location}
                    </span>
                  )}
                  {work.tags.map((tag) => (
                    <span key={tag} className="photo-lb-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
                {params.length > 0 && (
                  <details className="photo-lb-exif">
                    <summary>{t('exif')}</summary>
                    {params.map(([label, value]) => (
                      <div key={label} className="photo-lb-exif-row">
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                    ))}
                  </details>
                )}
                <div className="photo-lb-comments">
                  <Comment slug={work.slug} locale={locale} />
                </div>
                <p className="photo-lb-hint">
                  <span className="photo-lb-shortcuts">{t('shortcuts')} · </span>
                  {t('share')} #photo/{work.slug}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
