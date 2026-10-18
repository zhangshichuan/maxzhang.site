import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { FeaturedPosts } from '@/src/features/posts'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'
import { useRouter } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { HomeHero } from './home-hero'

interface Principle {
  title: string
  body: string
}

interface MethodItem {
  title: string
  body: string
}

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  return (
    <div className="os-home">
      <HomeHero />
      <CaseSection />
      <PrinciplesSection />
      <MethodSection />
      <FeaturedPosts posts={posts} index="04" />
      <Terminal />
      <ContactBand />
    </div>
  )
}

function CaseSection() {
  const t = useTranslations('HomePage.case')
  const rows: Array<[string, string]> = [
    [t('labels.context'), t('context')],
    [t('labels.decision'), t('decision')],
    [t('labels.result'), t('result')],
    [t('labels.role'), t('role')],
  ]

  return (
    <section id="case" className="os-panel">
      <div className="os-panel-head">
        <span className="os-panel-label">
          {t('side')} — {t('title')}
        </span>
        <span className="os-panel-meta">CASE FILE</span>
      </div>
      <h2 className="os-case-name">{t('name')}</h2>
      <dl className="os-case-rows">
        {rows.map(([label, value]) => (
          <div key={label} className="os-case-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function PrinciplesSection() {
  const t = useTranslations('HomePage.principles')
  const items = t.raw<Principle[]>('items') ?? []

  return (
    <section className="os-panel">
      <div className="os-panel-head">
        <span className="os-panel-label">
          {t('side')} — {t('title')}
        </span>
        <span className="os-panel-meta">03 / RULES</span>
      </div>
      <div className="os-principles">
        {items.map((item, index) => (
          <article key={item.title} className="os-principle">
            <span className="os-principle-no">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="os-principle-title">{item.title}</h3>
            <p className="os-principle-body">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function MethodSection() {
  const t = useTranslations('HomePage.method')
  const items = t.raw<MethodItem[]>('items') ?? []

  return (
    <section className="os-panel">
      <div className="os-panel-head">
        <span className="os-panel-label">
          {t('side')} — {t('title')}
        </span>
        <span className="os-panel-meta">4 STEPS</span>
      </div>
      <ol className="os-pipe">
        {items.map((item, index) => (
          <li key={item.title} className="os-pipe-step">
            <span className="os-pipe-no">{String(index + 1).padStart(2, '0')}</span>
            <span className="os-pipe-name">{item.title}</span>
            <span className="os-pipe-desc">{item.body}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Terminal() {
  const t = useTranslations('HomePage.prompt')
  const router = useRouter()
  const locale = useLocale()
  const [value, setValue] = useState('')
  const [lines, setLines] = useState<string[]>(['workspace mounted · read-only'])

  const run = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const raw = value.trim()
    if (!raw) return
    const command = raw.toLowerCase()
    const next: string[] = []
    if (command === 'help') next.push(t('help'))
    else if (command === 'work') {
      next.push('opening case_01')
      document.getElementById('case')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (command === 'notes') next.push('opening ~/posts')
    else if (command === 'about') next.push('opening ~/about')
    else if (command === 'contact') next.push('opening mail client')
    else if (command === 'clear') {
      setLines([])
      setValue('')
      return
    } else next.push(`command not found: ${raw}`)

    setLines((previous) => [...previous, `$ ${raw}`, ...next])
    setValue('')

    if (command === 'notes') router.navigate({ href: localizePath('/posts', locale) })
    if (command === 'about') router.navigate({ href: localizePath('/about', locale) })
    if (command === 'contact') window.location.href = 'mailto:zsc.guru@qq.com'
  }

  return (
    <section className="os-panel os-terminal">
      <div className="os-panel-head">
        <span className="os-panel-label">
          {t('label')} — {t('hint')}
        </span>
        <span className="os-panel-meta">READ-ONLY</span>
      </div>
      <div className="os-term-log" aria-live="polite">
        {lines.map((line, index) => (
          <div key={`${index}-${line}`} className="os-term-line">
            <span className="os-term-mark">{line.startsWith('$') ? '$' : '›'}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
      <form className="os-term-form" onSubmit={run}>
        <span className="os-ps1">mz@site:~$</span>
        <input
          className="os-term-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </section>
  )
}

function ContactBand() {
  const t = useTranslations('HomePage.contact')

  return (
    <section className="os-contact">
      <div>
        <h2>{t('title')}</h2>
        <p>{t('text')}</p>
      </div>
      <div className="os-actions">
        <Link href="mailto:zsc.guru@qq.com">
          <button className="btn btn-primary os-btn">
            {t('email')} <span aria-hidden>↗</span>
          </button>
        </Link>
        <Link href="https://github.com/zhangshichuan" target="_blank">
          <button className="btn btn-secondary os-btn">{t('github')}</button>
        </Link>
      </div>
    </section>
  )
}
