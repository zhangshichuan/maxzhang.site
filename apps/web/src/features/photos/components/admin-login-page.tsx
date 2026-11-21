import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'

/**
 * 管理登录页 — Night Instrument 私有入口
 *
 * 已登录：显示“前往摄影页”与“退出登录”（保留跳转逻辑）；
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
    return (
      <div className="ni-status" style={{ margin: 'auto 0' }}>
        <span className="ni-status-count">
          <b>●</b> {t('checking')}
        </span>
      </div>
    )
  }

  return (
    <div className="ni-auth">
      <aside className="ni-auth-aside">
        <div className="ni-auth-stamp">
          <span>
            <Lock className="size-3.5" strokeWidth={1.75} aria-hidden="true" /> MZ / Private archive
          </span>
          <span aria-hidden="true">( 01 )</span>
        </div>

        <span className="ni-auth-figure" aria-hidden="true">
          01
        </span>

        <div className="ni-auth-rows" aria-hidden="true">
          <div>
            <span>Access</span>
            <span className="is-red">Restricted</span>
          </div>
          <div>
            <span>Index</span>
            <span>Admin / 01</span>
          </div>
          <div>
            <span>Locale</span>
            <span>{locale.toUpperCase()}</span>
          </div>
        </div>
      </aside>

      <form className="ni-auth-form" onSubmit={submit}>
        <p className="ni-kicker ni-mono">{locale === 'zh' ? '管理员入口' : 'Admin access'}</p>
        <h1>{t('title')}</h1>
        <div className="ni-auth-rule" aria-hidden="true" />

        <label className="ni-field" htmlFor="ni-password">
          <span className="ni-field-label">
            <span>Passphrase</span>
            <span>Required</span>
          </span>
          <input
            id="ni-password"
            className="ni-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('password')}
            autoComplete="current-password"
            autoFocus
            disabled={submitting}
          />
        </label>

        {error && (
          <div className="ni-dialog-error" role="alert">
            {error}
            {retryAfter !== null && ` ${t('retryAfter', { seconds: Math.ceil(retryAfter) })}`}
          </div>
        )}

        <button type="submit" className="ni-auth-submit" disabled={!password || submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          {submitting ? t('submitting') : t('submit')}
        </button>

        <div className="ni-auth-foot" aria-hidden="true">
          <span>Max Zhang</span>
          <span>Private archive / 2026</span>
        </div>
      </form>
    </div>
  )
}
