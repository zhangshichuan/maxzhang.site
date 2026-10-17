import { useTranslations } from '@/src/i18n/client'

export function Footer() {
  const t = useTranslations('Common.footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <span>Max Zhang © {currentYear}</span>
      <span className="foot-mid">{t('role')}</span>
      <span>
        <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
          {t('github')}
        </a>
        {' · '}
        <a href="mailto:zsc.guru@qq.com">{t('email')}</a>
      </span>
    </footer>
  )
}
