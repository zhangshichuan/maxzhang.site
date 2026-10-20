import '@/src/styles/paper-about.css'

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

/** Static wind-field drawing (v5 / FLOW FIELD language), purely decorative. */
const FIELD_LINES = [
  'M-40 250C180 248 260 196 460 204S720 128 920 138S1200 84 1440 92',
  'M-40 272C200 266 280 220 480 228S760 152 960 162S1240 108 1440 116',
  'M-40 228C160 226 240 176 440 184S700 108 900 118S1180 64 1440 72',
  'M-40 290C220 284 300 240 500 248S780 172 980 182S1260 128 1440 136',
  'M-40 206C140 204 220 154 420 162S680 86 880 96S1160 42 1440 50',
  'M-40 184C160 182 240 132 440 140S700 64 900 74S1180 20 1440 28',
  'M-40 314C240 308 320 264 520 272S800 196 1000 206S1280 152 1440 160',
  'M-20 148C140 146 200 108 380 114S640 52 860 60S1180 12 1440 18',
  'M-20 328C260 322 340 278 540 286S820 210 1020 220S1300 166 1440 174',
  'M120 -30C90 60 220 96 190 176S300 300 340 380',
  'M380 -30C350 60 480 96 450 176S560 300 600 380',
  'M620 -30C590 60 720 96 690 176S800 300 840 380',
  'M860 -30C830 60 960 96 930 176S1040 300 1080 380',
  'M1100 -30C1070 60 1200 96 1170 176S1280 300 1320 380',
  'M210 -20C260 70 180 120 250 190S240 320 290 380',
  'M700 -20C750 70 670 120 740 190S730 320 780 380',
  'M980 -20C1030 70 950 120 1020 190S1010 320 1060 380',
  'M1280 -20C1330 70 1250 120 1320 190S1310 320 1360 380',
] as const

const FIELD_DOTS: ReadonlyArray<readonly [number, number, number]> = [
  [520, 206, 3],
  [880, 112, 2.6],
  [1180, 62, 2.2],
]

const FIELD_PARTICLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [210, 238, 1.2, 0.34],
  [300, 206, 1, 0.26],
  [420, 180, 1.4, 0.3],
  [560, 236, 1, 0.22],
  [640, 196, 1.3, 0.32],
  [720, 150, 1, 0.24],
  [800, 214, 1.5, 0.3],
  [980, 170, 1.1, 0.26],
  [1060, 128, 1.3, 0.3],
  [1200, 150, 1, 0.22],
  [1320, 110, 1.4, 0.28],
  [150, 172, 1.2, 0.26],
  [360, 268, 1, 0.22],
  [520, 290, 1.3, 0.3],
  [700, 86, 1, 0.24],
  [900, 240, 1.2, 0.26],
  [1120, 220, 1.4, 0.3],
  [1260, 250, 1, 0.22],
  [240, 120, 1.1, 0.24],
  [470, 110, 1, 0.2],
  [1040, 64, 1.2, 0.26],
  [1360, 200, 1, 0.2],
]

export function AboutPage() {
  const t = useTranslations('AboutPage')
  const intro = t.raw<string[]>('intro') ?? []
  const facts = t.raw<Fact[]>('facts') ?? []
  const timeline = t.raw<TimelineItem[]>('timeline') ?? []

  return (
    <div className="ab-page">
      <header className="ab-masthead">
        <div className="ab-masthead-field" aria-hidden="true">
          <svg viewBox="0 0 1400 340" preserveAspectRatio="none" fill="none">
            {FIELD_LINES.map((d, index) => (
              <path key={d} className="ab-field-line" d={d} style={{ opacity: 0.1 + (index % 5) * 0.045 }} />
            ))}
            {FIELD_PARTICLES.map(([cx, cy, r, opacity]) => (
              <circle key={`${cx}-${cy}`} className="ab-field-particle" cx={cx} cy={cy} r={r} opacity={opacity} />
            ))}
            {FIELD_DOTS.map(([cx, cy, r]) => (
              <circle key={`dot-${cx}-${cy}`} className="ab-field-dot" cx={cx} cy={cy} r={r} />
            ))}
          </svg>
        </div>

        <div className="ab-kicker">
          <span className="ab-kicker-main">
            <span className="ab-tick" aria-hidden="true" />
            Profile
          </span>
          <span className="ab-kicker-meta">Max Zhang</span>
        </div>

        <div className="ab-masthead-row">
          <h1 className="ab-title">{t('heading')}</h1>
          <div className="ab-masthead-aside">
            <p className="ab-status">
              <span className="ab-status-dot" aria-hidden="true" />
              {t('status')}
            </p>
            <p className="ab-masthead-meta">{t('location')}</p>
          </div>
        </div>

        <div className="ab-rule" aria-hidden="true" />
      </header>

      <section className="ab-profile" aria-labelledby="ab-intro-label">
        <div className="ab-profile-copy">
          <p className="ab-label" id="ab-intro-label">
            <span className="ab-label-no">01</span> / Intro
          </p>
          {intro.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? 'ab-intro ab-intro--lead' : 'ab-intro'}>
              {paragraph}
            </p>
          ))}
        </div>

        <figure className="ab-portrait">
          <div className="ab-portrait-frame">
            <img src={Avatar} alt="Max Zhang" width={952} height={952} />
          </div>
          <figcaption className="ab-portrait-caption">
            <span>Max Zhang</span>
            <span>Plate 01</span>
          </figcaption>
        </figure>
      </section>

      <section className="ab-record" aria-labelledby="ab-facts-title">
        <div className="ab-record-head">
          <p className="ab-label">
            <span className="ab-label-no">02</span> / Record
          </p>
          <p className="ab-record-meta">
            {String(facts.length).padStart(2, '0')} Facts / {String(timeline.length).padStart(2, '0')} Entries
          </p>
        </div>

        <div className="ab-sheet">
          <div className="ab-sheet-cols">
            <div className="ab-sheet-col ab-sheet-col--facts">
              <div className="ab-col-head">
                <h2 className="ab-col-title" id="ab-facts-title">
                  {t('factsTitle')}
                </h2>
                <span className="ab-col-meta">Properties</span>
              </div>
              <dl className="ab-facts">
                {facts.map((fact) => (
                  <div className="ab-fact" key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>
                      {fact.label === 'EMAIL' ? (
                        <Link className="ab-fact-link" href={`mailto:${fact.value}`}>
                          {fact.value}
                        </Link>
                      ) : (
                        <>
                          {fact.label === 'STATUS' && <span className="ab-fact-dot" aria-hidden="true" />}
                          {fact.value}
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="ab-sheet-col">
              <div className="ab-col-head">
                <h2 className="ab-col-title">{t('experienceTitle')}</h2>
                <span className="ab-col-meta">{String(timeline.length).padStart(2, '0')} Entries</span>
              </div>
              <ol className="ab-timeline">
                {timeline.map((item, index) => (
                  <li className="ab-timeline-row" key={`${item.period}-${item.company}`}>
                    <span className="ab-timeline-idx" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="ab-timeline-main">
                      <p className="ab-timeline-period">{item.period}</p>
                      <h3 className="ab-timeline-role">{item.role}</h3>
                      <p className="ab-timeline-company">{item.company}</p>
                      <p className="ab-timeline-note">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="ab-contact" aria-labelledby="ab-contact-title">
        <div className="ab-record-head">
          <p className="ab-label">
            <span className="ab-label-no">03</span> / Contact
          </p>
          <p className="ab-record-meta">{t('status')}</p>
        </div>

        <div className="ab-contact-grid">
          <h2 className="ab-contact-title" id="ab-contact-title">
            {t('contactTitle')}
          </h2>
          <div className="ab-contact-side">
            <p className="ab-contact-text">{t('contactText')}</p>
            <div className="ab-actions">
              <Link className="ab-btn" href="mailto:zsc.guru@qq.com">
                {t('contactEmail')}
                <span className="ab-btn-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
              <Link className="ab-link" href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
                {t('contactGithub')}
                <span className="ab-btn-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
