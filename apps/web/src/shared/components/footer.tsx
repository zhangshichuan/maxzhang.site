import { Link, useTranslations } from '@/src/i18n/client'

/**
 * Final shell — oversized marquee + contact index footer.
 */
export function Footer() {
  const t = useTranslations('Common.footer')
  const tn = useTranslations('Common.nav')
  const year = new Date().getFullYear()

  const marquee = ['AI product manager', 'Max Zhang', '0→1', 'Human in the loop', 'Designing trust']

  return (
    <footer className="zx-footer">
      <div className="zx-footer-marquee" aria-hidden="true">
        <div className="zx-footer-track">
          {[...marquee, ...marquee, ...marquee].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
      <div className="zx-footer-grid zx-shell">
        <div className="zx-footer-brand">
          <span className="zx-brand-mark">MZ</span>
          <div>
            <strong>MAX ZHANG</strong>
            <p>AI Product Manager</p>
          </div>
        </div>
        <div className="zx-footer-cell">
          <span className="zx-footer-k">Contact</span>
          <a href="mailto:zsc.guru@qq.com">zsc.guru@qq.com</a>
          <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
        <div className="zx-footer-cell">
          <span className="zx-footer-k">Index</span>
          <Link href="/posts">{tn('posts')}</Link>
          <Link href="/photos">{tn('photos')}</Link>
          <Link href="/about">{tn('about')}</Link>
        </div>
        <div className="zx-footer-cell">
          <span className="zx-footer-k">More</span>
          <Link href="/search">{tn('search')}</Link>
          <Link href="/chat">{tn('chat')}</Link>
          {tn('contact') ? <Link href="/#contact">{tn('contact')}</Link> : null}
        </div>
        <div className="zx-footer-meta">
          <span>© {year} Max Zhang</span>
          <span>{t('location')}</span>
          <span>{t('status')}</span>
        </div>
      </div>
    </footer>
  )
}
