import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { FeaturedPosts } from '@/src/features/posts'
import { Link, useTranslations } from '@/src/i18n/client'
import { HomeHero } from './home-hero'

interface Thesis {
  title: string
  body: string
}

interface MethodItem {
  title: string
  body: string
}

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  return (
    <>
      <HomeHero />
      <ThesesSection />
      <CaseSection />
      <MethodSection />
      <FeaturedPosts posts={posts} index="04" />
      <NowStrip />
      <ContactBand />
    </>
  )
}

function ThesesSection() {
  const t = useTranslations('Theses')
  const items = t.raw<Thesis[]>('items') ?? []

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">01 — {t('title')}</span>
          <span className="nx-block-side">{t('side')}</span>
        </div>
      </div>
      <div className="nx-thesis-grid">
        {items.map((item, index) => (
          <article key={item.title} className="nx-thesis">
            <span className="nx-thesis-num">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="nx-thesis-title">{item.title}</h3>
            <p className="nx-thesis-body">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CaseSection() {
  const t = useTranslations('HomePage.case')
  const rows: Array<[string, string]> = [
    [t('contextLabel'), t('context')],
    [t('decisionLabel'), t('decision')],
    [t('resultLabel'), t('result')],
  ]

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">02 — {t('title')}</span>
          <span className="nx-block-side">{t('side')}</span>
        </div>
      </div>
      <div className="nx-case">
        <h3 className="nx-case-name">{t('name')}</h3>
        <dl className="nx-case-rows">
          {rows.map(([label, value]) => (
            <div key={label} className="nx-case-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="nx-case-note">{t('note')}</p>
      </div>
    </section>
  )
}

function MethodSection() {
  const t = useTranslations('HomePage.method')
  const tBackground = useTranslations('HomePage.background')
  const items = t.raw<MethodItem[]>('items') ?? []

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">03 — {t('title')}</span>
          <span className="nx-block-side">{t('side')}</span>
        </div>
      </div>
      <div className="nx-method-grid">
        {items.map((item, index) => (
          <article key={item.title} className="nx-method">
            <span className="nx-method-num">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="nx-method-title">{item.title}</h3>
            <p className="nx-method-body">{item.body}</p>
          </article>
        ))}
      </div>
      <p className="nx-bg-line">
        <b>{tBackground('label')}</b>
        {tBackground('value')}
      </p>
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

function ContactBand() {
  const t = useTranslations('HomePage.contact')

  return (
    <section className="nx-contact">
      <div>
        <h2>{t('title')}</h2>
        <p>{t('text')}</p>
      </div>
      <div className="nx-contact-actions">
        <Link href="mailto:zsc.guru@qq.com">
          <button className="btn btn-primary nx-btn">
            {t('email')} <span aria-hidden>↗</span>
          </button>
        </Link>
        <Link href="https://github.com/zhangshichuan" target="_blank">
          <button className="btn btn-secondary nx-btn">{t('github')}</button>
        </Link>
      </div>
    </section>
  )
}
