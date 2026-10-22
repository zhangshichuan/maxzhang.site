import { Link, useTranslations } from '@/src/i18n/client'

/**
 * Fashion-editorial footer: oversized italic marquee + contact index.
 */
export function Footer() {
  const t = useTranslations('Common.footer')
  const tn = useTranslations('Common.nav')
  const year = new Date().getFullYear()

  const marquee = ['AI products', '0→1', 'Human in the loop', 'Designing trust', 'Retention +80%', 'Open for 2026']

  return (
    <footer className="fx-footer">
      <div className="fx-footer-marquee" aria-hidden="true">
        <div className="fx-footer-track">
          {[...marquee, ...marquee, ...marquee].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
      <div className="fx-footer-grid fx-shell">
        <div className="fx-footer-brand">
          <span className="fx-brand-mark">MZ</span>
          <div>
            <strong>MAX ZHANG</strong>
            <p>AI Product Manager</p>
          </div>
        </div>
        <div className="fx-footer-cell">
          <span className="fx-footer-k">Contact</span>
          <a href="mailto:zsc.guru@qq.com">zsc.guru@qq.com</a>
          <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
        <div className="fx-footer-cell">
          <span className="fx-footer-k">Index</span>
          <Link href="/posts">{tn('posts')}</Link>
          <Link href="/photos">{tn('photos')}</Link>
          <Link href="/about">{tn('about')}</Link>
        </div>
        <div className="fx-footer-cell">
          <span className="fx-footer-k">More</span>
          <Link href="/search">{tn('search')}</Link>
          <Link href="/chat">{tn('chat')}</Link>
          <Link href="/#contact">{tn('contact')}</Link>
        </div>
        <div className="fx-footer-meta">
          <span>© {year} Max Zhang</span>
          <span>Type — Bodoni Moda / Inter</span>
          <span>{t('location')}</span>
          <span>{t('status')}</span>
        </div>
      </div>
    </footer>
  )
}
