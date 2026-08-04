import { Link, useTranslations } from '@/src/i18n/client'

export function HomeHero() {
  const t = useTranslations('HomePage.hero')

  return (
    <div className="hero">
      <div className="hero-tagline">Fullstack Developer</div>
      <h1 className="hero-title">Max Zhang</h1>
      <p className="hero-slogan">{t('subtitle')}</p>
      <div className="btn-group">
        <Link href="/posts">
          <button className="btn btn-primary" style={{ padding: '12px 26px', fontSize: 14 }}>
            {t('readArticles')}
          </button>
        </Link>
        <Link href="/about">
          <button className="btn btn-secondary" style={{ padding: '12px 26px', fontSize: 14 }}>
            {t('aboutMe')}
          </button>
        </Link>
        <Link href="https://github.com/zhangshichuan" target="_blank">
          <button className="btn btn-ghost" style={{ padding: '12px 20px', fontSize: 14 }}>
            GitHub
          </button>
        </Link>
      </div>
    </div>
  )
}
