'use client'

import { Link } from '@/i18n/routing'
import { Github, Mail, Linkedin, MapPin, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
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

const techCategories: Record<string, string[]> = {
  'Languages': ['TypeScript', 'Python', 'Go', 'Rust'],
  'Frontend & Mobile': ['Next.js', 'React', 'React Native', 'Flutter', 'Taro', 'Electron'],
  'Backend & Data': ['FastAPI', 'PostgreSQL', 'Redis', 'Prisma'],
  'AI Agent': ['MCP', 'A2A', 'ReAct', 'LangChain', 'Dify', 'LLMOps'],
  'Infra': ['Docker', 'DevOps', 'Playwright'],
}

export function AboutPage() {
  const t = useTranslations('AboutPage')
  const paragraphs = t('description').split('\n\n').filter(Boolean)

  return (
    <div>
      {/* ===== Hero / 个人介绍 ===== */}
      <div className="hero" style={{ paddingTop: 40, minHeight: 'auto', paddingBottom: 20 }}>
        <div className="tagline">{t('role')}</div>
        <div className="about-profile">
          <div className="about-avatar-wrapper">
            <div className="about-avatar">
              <Image
                src={Avatar}
                alt="Max Zhang"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }}
                priority
              />
            </div>
            <div className="about-avatar-ring" />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.35)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MapPin style={{ width: 13, height: 13, color: 'var(--neon)' }} />
              {t('location')}
            </p>
            <div className="about-bio">
              {paragraphs.map((para, i) => (
                <p key={i} className="bio" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: i < paragraphs.length - 1 ? 16 : 0 }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="bio-divider" />

        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <Link href="https://github.com/zhangshichuan" target="_blank">
            <button className="btn btn-c" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Github style={{ width: 14, height: 14 }} /> GitHub
            </button>
          </Link>
          <Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
            <button className="btn btn-c" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Linkedin style={{ width: 14, height: 14 }} /> LinkedIn
            </button>
          </Link>
          <Link href="mailto:zsc.guru@qq.com">
            <button className="btn btn-g" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Mail style={{ width: 14, height: 14 }} /> Email
            </button>
          </Link>
        </div>
      </div>

      {/* ===== 技术栈 ===== */}
      <section>
        <div className="sec-head">
          <span className="bracket">[Tech stack]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(techCategories).map(([category, skills]) => (
            <div key={category}>
              <div className="tech-category-label">{category}</div>
              <div className="tech-tag-row">
                {skills.map((name) => (
                  <span key={name} className="tag">{name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 工作经历 ===== */}
      <section>
        <div className="sec-head">
          <span className="bracket">[Work]</span>
          <div className="line"></div>
        </div>
        <div className="exp-timeline">
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
                    <span key={tag} className="tag">{tag}</span>
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
        </div>
      </section>

      {/* ===== 研习方向 ===== */}
      <section>
        <div className="sec-head">
          <span className="bracket">[Learning]</span>
          <div className="line"></div>
        </div>
        <div className="learning-grid">
          {(t.raw('learningList') as string[]).map((item, index) => (
            <div key={index} className="learning-item">
              <span className="learning-num">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
              <ChevronRight className="learning-arrow" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== 教育经历 ===== */}
      <section>
        <div className="sec-head">
          <span className="bracket">[Education]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(t.raw('educationList') as Education[]).map((education, index) => (
            <div key={index} className="edu-card">
              <div className="edu-period">{education.period}</div>
              <div className="edu-school">{education.school}</div>
              <div className="edu-degree">{education.degree}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
