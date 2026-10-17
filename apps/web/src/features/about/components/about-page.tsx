import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { flattenSkills, skillMatrix } from '@/src/shared/skills'
import Avatar from '../avatar.jpg'

interface Story {
  title: string
  background: string
  decision: string
  action: string
  result: string
}

interface LookingFor {
  label: string
  value: string
}

interface TimelineItem {
  period: string
  role: string
  company: string
  note: string
}

interface Education {
  school: string
  degree: string
}

interface Stage {
  no: string
  range: string
  title: string
  brief: string
}

interface ModelItem {
  title: string
  body: string
}

const techCategories = skillMatrix.map((category) => ({
  title: category.title,
  titleEn: category.titleEn,
  items: flattenSkills(category.items),
}))

export function AboutPage() {
  const t = useTranslations('AboutPage')
  const tCurriculum = useTranslations('CurriculumPage')
  const locale = useLocale()

  const intro = t.raw<string[]>('intro') ?? []
  const stories = t.raw<Story[]>('stories') ?? []
  const lookingFor = t.raw<LookingFor[]>('lookingFor') ?? []
  const timeline = t.raw<TimelineItem[]>('timeline') ?? []
  const educationList = t.raw<Education[]>('educationList') ?? []
  const learningList = t.raw<string[]>('learningList') ?? []
  const interestList = t.raw<string[]>('interestList') ?? []
  const stages = tCurriculum.raw<Stage[]>('stages') ?? []
  const modelItems = tCurriculum.raw<ModelItem[]>('model.items') ?? []

  return (
    <div>
      <h1 className="page-title">{t('heading')}</h1>
      <p className="about-status">{t('status')}</p>

      <div className="about-profile">
        <div className="about-avatar-wrap">
          <div className="about-avatar">
            <img
              src={Avatar}
              alt="Max Zhang"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(25%)' }}
            />
          </div>
          <div className="about-avatar-ring" />
        </div>
        <div className="about-bio">
          <p className="mb-3 inline-flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--label-secondary)' }}>
            <MapPin className="size-3.5 text-primary" />
            {t('location')}
          </p>
          <div className="about-intro">
            {intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="btn-group" style={{ marginBottom: 0 }}>
        <Link href="https://github.com/zhangshichuan" target="_blank">
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 20px' }}
          >
            <Github className="size-4" /> GitHub
          </button>
        </Link>
        <Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 20px' }}
          >
            <Linkedin className="size-4" /> LinkedIn
          </button>
        </Link>
        <Link href="mailto:zsc.guru@qq.com">
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 20px' }}
          >
            <Mail className="size-4" /> Email
          </button>
        </Link>
      </div>

      <section>
        <div className="nx-block-head">
          <div className="nx-block-left">
            <span className="nx-block-index">01 — {t('trainingTitle')}</span>
            <span className="nx-block-side">{t('trainingSide')}</span>
          </div>
          <Link href="/curriculum" className="nx-more">
            {t('trainingLink')} →
          </Link>
        </div>
        <p className="kx-intro">{t('trainingNote')}</p>
        <div className="kx-stage-grid">
          {stages.map((stage) => (
            <article key={stage.no} className="kx-stage">
              <header className="kx-stage-head">
                <span className="kx-stage-no">{stage.no}</span>
                <span className="kx-stage-range">{stage.range}</span>
              </header>
              <h3 className="kx-stage-title">{stage.title}</h3>
              <p className="kx-stage-brief">{stage.brief}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="nx-block-head">
          <div className="nx-block-left">
            <span className="nx-block-index">02 — {t('capabilityTitle')}</span>
            <span className="nx-block-side">{t('capabilitySide')}</span>
          </div>
        </div>
        <div className="cx-model-grid">
          {modelItems.map((item, index) => (
            <article key={item.title} className="cx-model">
              <span className="cx-model-no">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="cx-model-title">{item.title}</h3>
              <p className="cx-model-body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="nx-block-head">
          <div className="nx-block-left">
            <span className="nx-block-index">03 — {t('storiesTitle')}</span>
            <span className="nx-block-side">{t('storiesSide')}</span>
          </div>
        </div>
        <div className="about-stories">
          {stories.map((story, index) => {
            const rows: Array<[string, string]> = [
              [t('storyLabels.background'), story.background],
              [t('storyLabels.decision'), story.decision],
              [t('storyLabels.action'), story.action],
              [t('storyLabels.result'), story.result],
            ]
            return (
              <article key={story.title} className="about-story">
                <header className="about-story-head">
                  <h3 className="about-story-title">{story.title}</h3>
                  <span className="about-story-index">{String(index + 1).padStart(2, '0')}</span>
                </header>
                <dl className="about-story-rows">
                  {rows.map(([label, value]) => (
                    <div key={label} className="about-story-row">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )
          })}
        </div>
      </section>

      <section>
        <div className="nx-block-head">
          <div className="nx-block-left">
            <span className="nx-block-index">04 — {t('lookingTitle')}</span>
            <span className="nx-block-side">{t('lookingSide')}</span>
          </div>
        </div>
        <div className="about-looking">
          {lookingFor.map((item) => (
            <div key={item.label} className="about-looking-item">
              <div className="about-looking-label">{item.label}</div>
              <div className="about-looking-value">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="nx-block-head">
          <div className="nx-block-left">
            <span className="nx-block-index">05 — {t('timelineTitle')}</span>
          </div>
        </div>
        <div className="about-timeline">
          {timeline.map((item) => (
            <div key={`${item.period}-${item.company}`} className="about-timeline-row">
              <span className="about-timeline-period">{item.period}</span>
              <span className="about-timeline-role">
                {item.role}
                <span className="about-timeline-company">{item.company}</span>
              </span>
              <span className="about-timeline-note">{item.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">{t('techStack')}</span>
          <div className="section-line"></div>
        </div>
        <p className="about-section-intro">{t('techIntro')}</p>
        {techCategories.map((category) => (
          <div key={category.title}>
            <div className="tech-category-label">{locale === 'zh' ? category.title : category.titleEn}</div>
            <div className="tech-tag-row">
              {category.items.map((name) => (
                <span key={name} className="chip">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">{t('learning')}</span>
          <div className="section-line"></div>
        </div>
        <div className="card-group">
          {learningList.map((item, index) => (
            <div key={index} className="card-row learning-item">
              <span className="learning-num">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">{t('education')}</span>
          <div className="section-line"></div>
        </div>
        <div className="card-group">
          {educationList.map((education, index) => (
            <div key={index} className="card-row edu-card">
              <div className="edu-school">{education.school}</div>
              <div className="edu-degree">{education.degree}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">{t('interests')}</span>
          <div className="section-line"></div>
        </div>
        <div className="chip-row">
          {interestList.map((item) => (
            <span key={item} className="chip chip-accent">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="nx-contact">
        <div>
          <h2>{t('contactTitle')}</h2>
          <p>{t('contactText')}</p>
        </div>
        <div className="nx-contact-actions">
          <Link href="mailto:zsc.guru@qq.com">
            <button className="btn btn-primary nx-btn">
              {t('contactEmail')} <span aria-hidden>↗</span>
            </button>
          </Link>
          <Link href="https://github.com/zhangshichuan" target="_blank">
            <button className="btn btn-secondary nx-btn">{t('contactGithub')}</button>
          </Link>
        </div>
      </section>
    </div>
  )
}
