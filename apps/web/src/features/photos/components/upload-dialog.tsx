import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Loader2, Lock, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="appearance-backdrop"
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            className="upload-dialog glass-panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="appearance-panel-header">
              <span className="appearance-panel-title">{t('title')}</span>
              <button type="button" className="icon-btn icon-btn-sm" onClick={close} aria-label={t('close')}>
                <X className="size-4" />
              </button>
            </div>

            <button
              type="button"
              className="upload-dropzone"
              onClick={() => fileRef.current?.click()}
              disabled={submitting}
            >
              <ImagePlus className="size-7" strokeWidth={1.75} />
              {picked.length > 0 ? `${picked.length} ${t('selected')}` : t('pickFiles')}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  const picked = Array.from(event.target.files ?? [])
                  event.target.value = ''
                  if (picked.length > 10) {
                    setError(t('tooMany'))
                    return
                  }
                  releasePreviews(pickedRef.current)
                  replacePicked(picked.map((file) => ({ file, preview: URL.createObjectURL(file) })))
                  setError(null)
                }}
              />
            </button>

            {picked.length > 0 && (
              <div className="upload-previews">
                {picked.map((item, index) => (
                  <div key={item.preview} className="upload-preview">
                    <img src={item.preview} alt="" />
                    <button
                      type="button"
                      className="upload-preview-remove"
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

            <div className="upload-fields">
              <input
                className="ios-input"
                placeholder={t('captionZh')}
                value={captionZh}
                onChange={(event) => setCaptionZh(event.target.value)}
                disabled={submitting}
              />
              <input
                className="ios-input"
                placeholder={t('captionEn')}
                value={captionEn}
                onChange={(event) => setCaptionEn(event.target.value)}
                disabled={submitting}
              />
              <input
                className="ios-input"
                placeholder={t('location')}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                disabled={submitting}
              />
              <input
                className="ios-input"
                placeholder={t('tags')}
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                disabled={submitting}
              />
            </div>

            {needsLogin && (
              <div className="upload-login">
                <Lock className="size-4" />
                <input
                  className="ios-input"
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                />
              </div>
            )}

            {error && <div className="alert alert-error mt-2 text-xs">{error}</div>}

            <button
              type="button"
              className="btn btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
              onClick={submit}
              disabled={submitting || picked.length === 0 || !captionZh.trim()}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {submitting ? t('submitting') : t('submit')}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
