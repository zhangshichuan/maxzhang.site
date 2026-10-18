import { useTranslations } from '@/src/i18n/client'

export function Footer() {
  const t = useTranslations('Common.footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="os-footer">
      <span className="os-foot-brand">MZ/OS — MAX ZHANG © {currentYear}</span>
      <span className="os-foot-status">
        <i aria-hidden />
        {t('status')}
      </span>
      <span className="os-foot-loc">{t('location')}</span>
      <span className="os-foot-tagline">{t('tagline')}</span>
      <span className="os-foot-links">
        <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
          {t('github')}
        </a>
        <a href="mailto:zsc.guru@qq.com">{t('email')}</a>
      </span>
    </footer>
  )
}
