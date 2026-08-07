import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { useEffect } from 'react'
import { useLocale } from '@/src/i18n/client'
import { registerFingerprint } from '@/src/features/engagement/server-functions'

/** 首页挂载时登记浏览器指纹，无任何可见 UI */
export function FingerprintRegistrar() {
  const locale = useLocale()

  useEffect(() => {
    let cancelled = false
    const register = async () => {
      try {
        const response = await getThumbmark()
        if (cancelled) return
        await registerFingerprint({
          data: { fingerprint: response.thumbmark, locale },
        })
      } catch (error) {
        console.error('Failed to register fingerprint:', error)
      }
    }
    register()
    return () => {
      cancelled = true
    }
  }, [locale])

  return null
}
