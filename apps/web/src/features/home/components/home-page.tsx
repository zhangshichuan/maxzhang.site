import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { FeaturedPosts } from '@/src/features/posts'
import { Link, useTranslations } from '@/src/i18n/client'
import { HomeHero } from './home-hero'

interface Capability {
  title: string
  items: string[]
}

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  return (
    <>
      <HomeHero />
      <FeaturedPosts posts={posts} />
      <CapabilitySection />
      <NowStrip />
    </>
  )
}

function CapabilitySection() {
  const t = useTranslations('HomePage.capabilities')
  const capabilities = t.raw<Capability[]>('items') ?? []

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">02 — {t('title')}</span>
          <span className="nx-block-side">{t('side')}</span>
        </div>
      </div>

      <div className="nx-cap-grid">
        {capabilities.map((capability, index) => (
          <div key={capability.title} className="nx-cap">
            <div className="nx-cap-title">
              <b>{String(index + 1).padStart(2, '0')}</b>
              {capability.title}
            </div>
            <ul className="nx-cap-list">
              {capability.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function NowStrip() {
  const t = useTranslations('HomePage.now')

  return (
    <section className="nx-now">
      <span className="nx-block-index">{t('label')}</span>
      <p>{t('text')}</p>
      <Link href="https://github.com/zhangshichuan" target="_blank">
        {t('link')} ↗
      </Link>
    </section>
  )
}
