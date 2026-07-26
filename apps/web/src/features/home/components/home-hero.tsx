'use client'

import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function HomeHero() {
  const t = useTranslations('HomePage.hero')

  return (
    <div className="hero">
      <div>
        <div className="tagline">Fullstack Developer</div>
        <div className="glitch-block">
          <h1 className="glitch" data-text="BUILD HARDER. GLITCH LOUDER.">
            BUILD HARDER. GLITCH LOUDER.
          </h1>
        </div>
        <div className="btn-group">
          <Link href="/posts">
            <button className="btn btn-p">{t('readArticles')}</button>
          </Link>
          <Link href="/about">
            <button className="btn btn-c">{t('aboutMe')}</button>
          </Link>
          <Link href="https://github.com/zhangshichuan" target="_blank">
            <button className="btn btn-g">GitHub</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
