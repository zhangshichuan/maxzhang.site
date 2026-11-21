import { Link, useLocale, useTranslations } from '@/src/i18n/client'
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
  const locale = useLocale()
  const tn = useTranslations('Common.nav')
  const intro = t.raw<string[]>('intro') ?? []
  const facts = t.raw<Fact[]>('facts') ?? []
  const timeline = t.raw<TimelineItem[]>('timeline') ?? []

  return (
    <div className="ni-page">
      <header className="ni-page-head">
        <p className="ni-kicker ni-mono ni-page-kicker">
          {locale === 'zh' ? '人员档案 001 / 简介' : 'Personnel file 001 / Profile'}
        </p>
        <div className="ni-page-head-grid">
          <h1 className="ni-page-title">{t('heading')}</h1>
          <div className="ni-page-aside">
            <div className="ni-page-stat">
              <span>Status</span>
              <b>{t('status')}</b>
            </div>
            <div className="ni-page-stat">
              <span>Location</span>
              <b>{t('location')}</b>
            </div>
          </div>
        </div>
      </header>

      <section className="ni-about-intro" aria-labelledby="ni-about-intro-label">
        <div className="ni-about-copy">
          <p className="ni-kicker ni-mono" id="ni-about-intro-label">
            <span className="ni-index">01</span> / {locale === 'zh' ? '简介' : 'Intro'}
          </p>
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <figure className="ni-portrait">
          <img src={Avatar} alt="Max Zhang" width={952} height={952} />
          <figcaption>
            <span>Max Zhang</span>
            <span>Plate 01</span>
          </figcaption>
        </figure>
      </section>

      <section className="ni-section" aria-labelledby="ni-about-facts-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">02</span>
          <h2 id="ni-about-facts-title">{t('factsTitle')}</h2>
          <span className="ni-section-link" aria-hidden="true">
            {String(facts.length).padStart(2, '0')} Facts / {String(timeline.length).padStart(2, '0')} Entries
          </span>
        </header>

        <div className="ni-record">
          <dl className="ni-facts">
            {facts.map((fact) => (
              <div className="ni-fact-row" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd className={fact.label === 'STATUS' ? 'is-status' : undefined}>
                  {fact.label === 'EMAIL' ? <a href={`mailto:${fact.value}`}>{fact.value}</a> : fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <ol className="ni-timeline">
            {timeline.map((item, index) => (
              <li className="ni-timeline-row" key={`${item.period}-${item.company}`}>
                <span className="ni-timeline-index ni-mono" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="ni-timeline-main">
                  <p className="ni-timeline-period">{item.period}</p>
                  <h3 className="ni-timeline-role">{item.role}</h3>
                  <p className="ni-timeline-company">{item.company}</p>
                  <p className="ni-timeline-note">{item.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ni-section" aria-labelledby="ni-about-contact-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">03</span>
          <h2 id="ni-about-contact-title">{tn('contact')}</h2>
          <span className="ni-section-link" aria-hidden="true">
            {t('contactEmail')}
          </span>
        </header>

        <div className="ni-contact" style={{ marginTop: 24 }}>
          <div>
            <h2>{t('contactTitle')}</h2>
            <a className="ni-email" href="mailto:zsc.guru@qq.com">
              zsc.guru@qq.com
            </a>
          </div>
          <div className="ni-contact-side">
            <span className="ni-mono">{t('status')}</span>
            <p>{t('contactText')}</p>
            <Link className="ni-section-link" href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
              {t('contactGithub')} ↗
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
