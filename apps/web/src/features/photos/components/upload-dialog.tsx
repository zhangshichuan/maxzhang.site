import '@/src/styles/paper-photos.css'

import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Loader2, Lock, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from '@/src/i18n/client'

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  onUploaded: (slug: string) => void
}

interface PickedFile {
  file: File
  preview: string
}

export function UploadDialog({ open, onClose, onUploaded }: UploadDialogProps) {
  const t = useTranslations('UploadDialog')
  const [picked, setPicked] = useState<PickedFile[]>([])
  const pickedRef = useRef<PickedFile[]>([])
  const [captionZh, setCaptionZh] = useState('')
  const [captionEn, setCaptionEn] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')
  const [password, setPassword] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [portalReady, setPortalReady] = useState(false)

  // Portal into <body> so the dialog escapes .site-shell's stacking context.
  useEffect(() => setPortalReady(true), [])

  const releasePreviews = (items: PickedFile[]) => {
    for (const item of items) {
      URL.revokeObjectURL(item.preview)
    }
  }

  const replacePicked = (next: PickedFile[]) => {
    pickedRef.current = next
    setPicked(next)
  }

  useEffect(() => {
    return () => releasePreviews(pickedRef.current)
  }, [])

  const reset = () => {
    releasePreviews(pickedRef.current)
    replacePicked([])
    setCaptionZh('')
    setCaptionEn('')
    setLocation('')
    setTags('')
    setPassword('')
    setNeedsLogin(false)
    setError(null)
  }

  const close = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const submit = async () => {
    if (submitting || picked.length === 0) return
    setSubmitting(true)
    setError(null)

    try {
      if (needsLogin) {
        const loginResponse = await fetch('/api/photos/login', {
          method: 'POST',
          headers: { 'x-admin-request': '1', 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        if (!loginResponse.ok) {
          setError(t('invalidPassword'))
          return
        }
        setNeedsLogin(false)
      }

      const form = new FormData()
      for (const { file } of picked) {
        form.append('files', file)
      }
      form.append('captionZh', captionZh)
      form.append('captionEn', captionEn)
      form.append('location', location)
      form.append('tags', tags)

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: { 'x-admin-request': '1' },
        body: form,
      })
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; slug?: string; error?: string }
      if (response.ok && data.slug) {
        reset()
        onUploaded(data.slug)
        return
      }
      if (response.status === 401) {
        setNeedsLogin(true)
        setError(t('loginRequired'))
      } else {
        setError(data.error || t('error'))
      }
    } catch {
      setError(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const removeFile = (index: number) => {
    const current = pickedRef.current
    if (!current[index]) return
    URL.revokeObjectURL(current[index].preview)
    replacePicked(current.filter((_, itemIndex) => itemIndex !== index))
  }

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="upload-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
          className="ph-upload-backdrop ph-surface"
          onClick={close}
          aria-hidden="true"
        />
      )}
      {open && (
        <motion.div
          key="upload-shell"
          className="ph-upload-shell ph-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            className="ph-upload ph-surface"
            initial={{ opacity: 0, y: 20, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.994, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="ph-upload-head">
              <div className="ph-upload-head-main">
                <p className="ph-label">Upload — Photo Work</p>
                <h2 className="ph-upload-title">{t('title')}</h2>
              </div>
              <button type="button" className="ph-upload-close" onClick={close} aria-label={t('close')}>
                <X className="size-4" />
              </button>
            </div>

            <div className="ph-upload-body">
              <button
                type="button"
                className="ph-dropzone"
                onClick={() => fileRef.current?.click()}
                disabled={submitting}
              >
                <span className="ph-dropzone-icon">
                  <ImagePlus className="size-4" strokeWidth={1.75} />
                </span>
                <span className="ph-dropzone-text">
                  {picked.length > 0 ? `${picked.length} ${t('selected')}` : t('pickFiles')}
                </span>
                <span className="ph-dropzone-hint">Max 10 files</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  event.target.value = ''
                  if (files.length > 10) {
                    setError(t('tooMany'))
                    return
                  }
                  releasePreviews(pickedRef.current)
                  const next = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
                  replacePicked(next)
                  setError(null)
                }}
              />

              {picked.length > 0 && (
                <div className="ph-previews">
                  {picked.map((item, index) => (
                    <div key={item.preview} className="ph-preview">
                      <img src={item.preview} alt="" />
                      <button
                        type="button"
                        className="ph-preview-remove"
                        onClick={() => removeFile(index)}
                        disabled={submitting}
                        aria-label={t('remove')}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="ph-fields">
                <input
                  className="ph-input"
                  placeholder={t('captionZh')}
                  aria-label={t('captionZh')}
                  value={captionZh}
                  onChange={(event) => setCaptionZh(event.target.value)}
                  disabled={submitting}
                />
                <input
                  className="ph-input"
                  placeholder={t('captionEn')}
                  aria-label={t('captionEn')}
                  value={captionEn}
                  onChange={(event) => setCaptionEn(event.target.value)}
                  disabled={submitting}
                />
                <input
                  className="ph-input"
                  placeholder={t('location')}
                  aria-label={t('location')}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={submitting}
                />
                <input
                  className="ph-input"
                  placeholder={t('tags')}
                  aria-label={t('tags')}
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  disabled={submitting}
                />
              </div>

              {needsLogin && (
                <div className="ph-login">
                  <span className="ph-login-label">
                    <Lock className="size-3" />
                    Admin
                  </span>
                  <input
                    className="ph-input"
                    type="password"
                    placeholder={t('password')}
                    aria-label={t('password')}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={submitting}
                  />
                </div>
              )}

              {error && <div className="ph-alert">{error}</div>}
            </div>

            <div className="ph-upload-foot">
              <p className="ph-upload-note">
                {picked.length} / 10 · {t('selected')}
              </p>
              <button
                type="button"
                className="ph-btn-primary"
                onClick={submit}
                disabled={submitting || picked.length === 0 || !captionZh.trim()}
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {submitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (!portalReady) return null
  return createPortal(content, document.body)
}
