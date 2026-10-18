import { Link, useTranslations } from '@/src/i18n/client'
import Avatar from '../avatar.jpg'

interface Fact {
  label: string
  value: string
}

interface TimelineItem {
  period: string
  role: string
  company: string
  note: string
}

export function AboutPage() {
  const t = useTranslations('AboutPage')
  const intro = t.raw<string[]>('intro') ?? []
  const facts = t.raw<Fact[]>('facts') ?? []
  const timeline = t.raw<TimelineItem[]>('timeline') ?? []

  return (
    <div className="os-page os-about">
      <div className="os-kicker">~/about</div>
      <h1 className="os-page-title">{t('heading')}</h1>
      <p className="os-status">
        <span className="os-dot" aria-hidden />
        {t('status')}
      </p>

      <div className="os-about-head">
        <div className="os-about-intro">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="os-about-avatar">
          <img src={Avatar} alt="Max Zhang" />
        </div>
      </div>

      <div className="os-about-grid">
        <section className="os-panel">
          <div className="os-panel-head">
            <span className="os-panel-label">{t('factsTitle')}</span>
            <span className="os-panel-meta">PROPERTIES</span>
          </div>
          <dl className="os-props">
            {facts.map((fact) => (
              <div key={fact.label} className="os-prop">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="os-panel">
          <div className="os-panel-head">
            <span className="os-panel-label">{t('experienceTitle')}</span>
            <span className="os-panel-meta">{String(timeline.length).padStart(2, '0')} ENTRIES</span>
          </div>
          <div className="os-timeline">
            {timeline.map((item) => (
              <div key={`${item.period}-${item.company}`} className="os-timeline-row">
                <span className="os-timeline-period">{item.period}</span>
                <span className="os-timeline-role">
                  {item.role}
                  <em>{item.company}</em>
                </span>
                <span className="os-timeline-note">{item.note}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="os-contact">
        <div>
          <h2>{t('contactTitle')}</h2>
          <p>{t('contactText')}</p>
        </div>
        <div className="os-actions">
          <Link href="mailto:zsc.guru@qq.com">
            <button className="btn btn-primary os-btn">
              {t('contactEmail')} <span aria-hidden>↗</span>
            </button>
          </Link>
          <Link href="https://github.com/zhangshichuan" target="_blank">
            <button className="btn btn-secondary os-btn">{t('contactGithub')}</button>
          </Link>
        </div>
      </section>
    </div>
  )
}
