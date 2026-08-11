import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'

/**
 * 管理登录页
 *
 * 已登录：显示“前往摄影页”与“退出登录”；
 * 未登录：口令表单，失败次数过多时展示锁定倒计时。
 */
export function AdminLoginPage() {
  const t = useTranslations('AdminPage')
  const locale = useLocale()
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/photos/status')
      .then((response) => response.json())
      .then((data) => {
        if (data.admin) {
          window.location.replace(localizePath('/admin', locale))
          return
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [locale])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password || submitting) return
    setSubmitting(true)
    setError(null)
    setRetryAfter(null)
    try {
      const response = await fetch('/api/photos/login', {
        method: 'POST',
        headers: { 'x-admin-request': '1', 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string; retryAfter?: number }
      if (response.ok) {
        window.location.href = localizePath('/admin', locale)
        return
      }
      if (response.status === 429) {
        setRetryAfter(data.retryAfter ?? 900)
        setError(t('rateLimited'))
      } else if (response.status === 403) {
        setError(t('ipNotAllowed'))
      } else if (response.status === 503) {
        setError(t('unavailable'))
      } else {
        setError(t('wrongPassword'))
      }
    } catch {
      setError(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return <div className="empty-state">{t('checking')}</div>
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card glass-card" onSubmit={submit}>
        <div className="admin-login-head">
          <Lock className="size-5 text-primary" />
          <h1 className="appearance-panel-title">{t('title')}</h1>
        </div>

        <input
          className="ios-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('password')}
          autoFocus
          disabled={submitting}
        />
        {error && (
          <div className="alert alert-error mt-3 text-xs">
            {error}
            {retryAfter !== null && ` ${t('retryAfter', { seconds: Math.ceil(retryAfter) })}`}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
          disabled={!password || submitting}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {submitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  )
}
