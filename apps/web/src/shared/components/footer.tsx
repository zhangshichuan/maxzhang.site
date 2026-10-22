import { Link, useTranslations } from '@/src/i18n/client'

/**
 * Flow Field 页脚：纸面状态条 + 低频入口。
 */
export function Footer() {
  const t = useTranslations('Common.footer')
  const tn = useTranslations('Common.nav')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-cell">
          <span className="footer-k">STATUS</span>
          <span className="footer-v mono">{t('status')}</span>
        </div>
        <div className="footer-cell">
          <span className="footer-k">BASE</span>
          <span className="footer-v mono">{t('location')}</span>
        </div>
        <p className="footer-tag">{t('tagline')}</p>
        <p className="footer-copy">© {currentYear} Max Zhang</p>
      </div>
      <div className="footer-links">
        <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
          {t('github')}
        </a>
        <a href="mailto:zsc.guru@qq.com">{t('email')}</a>
        <Link href="/photos">{tn('photos')}</Link>
        <Link href="/search">{tn('search')}</Link>
        <Link href="/chat">{tn('chat')}</Link>
      </div>
    </footer>
  )
}
