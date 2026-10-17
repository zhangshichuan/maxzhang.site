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

interface Stage {
  no: string
  range: string
  title: string
  brief: string
  methods: string[]
}

interface CasePreview {
  no: string
  name: string
  tag: string
  note: string
}

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  return (
    <>
      <HomeHero />
      <ThesesSection />
      <KnowledgeSection />
      <CasesSection />
      <MethodSection />
      <FeaturedPosts posts={posts} index="05" />
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

function KnowledgeSection() {
  const t = useTranslations('HomePage.knowledge')
  const stages = t.raw<Stage[]>('stages') ?? []

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">02 — {t('title')}</span>
          <span className="nx-block-side">{t('side')}</span>
        </div>
        <Link href="/curriculum" className="nx-more">
          {t('cta')} →
        </Link>
      </div>
      <p className="kx-intro">{t('intro')}</p>
      <div className="kx-stage-grid">
        {stages.map((stage) => (
          <article key={stage.no} className="kx-stage">
            <header className="kx-stage-head">
              <span className="kx-stage-no">{stage.no}</span>
              <span className="kx-stage-range">{stage.range}</span>
            </header>
            <h3 className="kx-stage-title">{stage.title}</h3>
            <p className="kx-stage-brief">{stage.brief}</p>
            <ul className="kx-stage-methods">
              {stage.methods.map((method) => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function CasesSection() {
  const t = useTranslations('HomePage.cases')
  const items = t.raw<CasePreview[]>('items') ?? []

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">03 — {t('title')}</span>
          <span className="nx-block-side">{t('side')}</span>
        </div>
        <Link href="/cases" className="nx-more">
          {t('cta')} →
        </Link>
      </div>
      <p className="kx-intro">{t('intro')}</p>
      <div className="kx-case-grid">
        {items.map((item) => (
          <Link key={item.no} href="/cases" className="kx-case">
            <span className="kx-case-no">{item.no}</span>
            <span className="kx-case-tag">{item.tag}</span>
            <h3 className="kx-case-name">{item.name}</h3>
            <p className="kx-case-note">{item.note}</p>
          </Link>
        ))}
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
          <span className="nx-block-index">04 — {t('title')}</span>
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
