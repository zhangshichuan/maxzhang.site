import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { PhotoWorkSummary } from '@/src/features/photos/model'
import { listPhotoWorksFn } from '@/src/features/photos/server-functions'
import { useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'
import { UploadDialog } from './upload-dialog'

/**
 * 管理后台
 *
 * 未登录时自动跳回 /login；已登录展示作品列表、上传与删除操作。
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
    return <div className="empty-state">{t('checking')}</div>
  }

  return (
    <div className="admin-console">
      <div className="admin-console-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('description')}</p>
        </div>
      </div>

      <button type="button" className="admin-upload-trigger" onClick={() => setUploadOpen(true)}>
        <span className="admin-upload-trigger-icon">
          <Plus className="size-4" strokeWidth={1.75} />
        </span>
        {t('upload')}
      </button>

      {works.length === 0 ? (
        <div className="empty-state">{t('empty')}</div>
      ) : (
        <div className="card-group">
          {works.map((work) => (
            <div key={work.slug} className="card-row">
              <img src={work.thumbUrl} alt="" className="admin-work-thumb" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{work.caption}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(work.takenAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')} ·{' '}
                  {t('photosCount', { count: work.photoCount })}
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => remove(work.slug)}
                disabled={deleting === work.slug}
                aria-label={t('delete')}
              >
                {deleting === work.slug ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </div>
          ))}
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
