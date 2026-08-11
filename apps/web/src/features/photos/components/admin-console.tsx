import { ArrowRight, Loader2, LogOut, Plus, Trash2 } from 'lucide-react'
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

  const logout = async () => {
    await fetch('/api/photos/logout', {
      method: 'POST',
      headers: { 'x-admin-request': '1' },
    }).catch(() => {})
    window.location.href = localizePath('/login', locale)
  }

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
        <div className="admin-console-actions">
          <button
            type="button"
            className="btn btn-primary inline-flex items-center gap-2"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="size-4" />
            {t('upload')}
          </button>
          <a className="btn btn-ghost inline-flex items-center gap-2" href={localizePath('/photos', locale)}>
            <ArrowRight className="size-4" />
            {t('viewPhotos')}
          </a>
          <button type="button" className="btn btn-ghost inline-flex items-center gap-2" onClick={logout}>
            <LogOut className="size-4" />
            {t('logout')}
          </button>
        </div>
      </div>

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
