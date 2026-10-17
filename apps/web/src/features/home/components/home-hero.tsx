import { Link, useTranslations } from '@/src/i18n/client'

export function HomeHero() {
  const t = useTranslations('HomePage.hero')

  return (
    <section className="nx-hero">
      <div className="nx-eyebrow">
        <span className="nx-dot" />
        {t('eyebrow')}
      </div>

      <h1 className="nx-hero-title">
        {t('headline1')}
        <br />
        <span className="nx-grad">{t('headline2')}</span>
      </h1>

      <p className="nx-lede">{t('lede')}</p>

      <div className="nx-actions">
        <Link href="/posts">
          <button className="btn btn-primary nx-btn">
            {t('readArticles')} <span aria-hidden>↗</span>
          </button>
        </Link>
        <Link href="/about">
          <button className="btn btn-secondary nx-btn">{t('aboutMe')}</button>
        </Link>
        <Link href="mailto:zsc.guru@qq.com">
          <button className="btn btn-ghost nx-btn">{t('emailMe')}</button>
        </Link>
      </div>

      <div className="nx-meta">
        <div className="nx-meta-item">
          <span className="nx-k">{t('meta1Label')}</span>
          <span className="nx-v">{t('meta1Value')}</span>
        </div>
        <div className="nx-meta-item">
          <span className="nx-k">{t('meta2Label')}</span>
          <span className="nx-v">{t('meta2Value')}</span>
        </div>
        <div className="nx-meta-item">
          <span className="nx-k">{t('meta3Label')}</span>
          <span className="nx-v">
            <span className="nx-live" />
            {t('meta3Value')}
          </span>
        </div>
      </div>
    </section>
  )
}
