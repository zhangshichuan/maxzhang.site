import { Link, useTranslations } from '@/src/i18n/client'
import { ChevronRight, Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { flattenSkills, skillMatrix } from '@/src/shared/skills'
import Avatar from '../avatar.jpg'

interface Experience {
  role: string
  company: string
  period: string
  tags: string[]
  points: string[]
}

interface Education {
  school: string
  period: string
  degree: string
}

const techCategories = Object.fromEntries(skillMatrix.map((s) => [s.title, flattenSkills(s.items)]))

export function AboutPage() {
  const t = useTranslations('AboutPage')
  const paragraphs = t('description').split('\n\n').filter(Boolean)

  return (
    <div>
      <h1 className="page-title">{t('heading')}</h1>
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
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      <div className="btn-group" style={{ marginBottom: 32 }}>
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
        <div className="section-head">
          <span className="section-title">{t('techStack')}</span>
          <div className="section-line"></div>
        </div>
        {Object.entries(techCategories).map(([category, skills]) => (
          <div key={category}>
            <div className="tech-category-label">{category}</div>
            <div className="tech-tag-row">
              {skills.map((name) => (
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
          <span className="section-title">{t('workExperience')}</span>
          <div className="section-line"></div>
        </div>
        {(t.raw('experience') as Experience[]).map((exp, index) => (
          <div key={index} className="exp-card">
            <div className="exp-card-header">
              <div className="exp-period">{exp.period}</div>
              <div className="exp-company">@ {exp.company}</div>
            </div>
            <h3 className="exp-role">{exp.role}</h3>
            {exp.tags && exp.tags.length > 0 && (
              <div className="exp-tags">
                {exp.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <ul className="exp-points">
              {exp.points.map((point, i) => (
                <li key={i}>
                  <span className="exp-point-num">{String(i + 1).padStart(2, '0')}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">{t('learning')}</span>
          <div className="section-line"></div>
        </div>
        <div className="card-group">
          {(t.raw('learningList') as string[]).map((item, index) => (
            <div key={index} className="card-row learning-item">
              <span className="learning-num">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
              <ChevronRight className="learning-arrow size-4" />
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
          {(t.raw('educationList') as Education[]).map((education, index) => (
            <div key={index} className="card-row edu-card">
              {education.period && <div className="edu-period">{education.period}</div>}
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
          {(t.raw('interestList') as string[]).map((item) => (
            <span key={item} className="chip chip-accent">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
