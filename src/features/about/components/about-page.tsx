'use client'

import { Link } from '@/i18n/routing'
import { Github, Mail, Linkedin, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Avatar from '../avatar.jpg'

interface Experience {
  role: string
  company: string
  period: string
  points: string[]
}

interface Education {
  school: string
  period: string
  degree: string
}

const techStack = [
  'TypeScript',
  'Python',
  'Next.js',
  'FastAPI',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Prisma',
  'Playwright',
  'MCP',
  'A2A',
  'ReAct',
  'LangChain',
  'Dify',
  'LLMOps',
  'DevOps',
  'Taro',
  'Flutter',
  'React Native',
  'Electron',
]

export function AboutPage() {
  const t = useTranslations('AboutPage')

  return (
    <div>
      {/* ===== 个人介绍 ===== */}
      <div className="hero" style={{ paddingTop: 40, minHeight: 'auto' }}>
        <div>
          <div className="tagline">{t('role')}</div>
          <div className="glitch-block" style={{ marginBottom: 12 }}>
            <h1 className="glitch" data-text="MAXZHANG" style={{ fontSize: 'clamp(32px,5vw,56px)' }}>
              MAXZHANG
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', marginBottom: 24 }}>
            <div
              style={{
                width: 100,
                height: 100,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--card)',
                border: '1px solid rgba(255,255,255,.06)',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
              }}
            >
              <Image
                src={Avatar}
                alt="Max Zhang"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }}
                priority
              />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,.35)',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <MapPin style={{ width: 13, height: 13, color: 'var(--neon)' }} />
                {t('location')}
              </p>
              <p className="bio" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: 0 }}>
                {t('description')}
              </p>
            </div>
          </div>

          <div className="btn-group">
            <Link href="https://github.com/zhangshichuan" target="_blank">
              <button className="btn btn-c" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <Github style={{ width: 14, height: 14 }} /> GitHub
              </button>
            </Link>
            <Link href="mailto:zsc.guru@qq.com">
              <button className="btn btn-c" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <Mail style={{ width: 14, height: 14 }} /> Email
              </button>
            </Link>
            <Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
              <button className="btn btn-g" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <Linkedin style={{ width: 14, height: 14 }} /> LinkedIn
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 技术栈 ===== */}
      <section>
        <div className="sec-head">
          <span className="bracket">[Tech stack]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {techStack.map((name) => {
            const primary = ['TypeScript', 'Python', 'MCP', 'A2A', 'ReAct'].includes(name)
            return (
              <span key={name} className={primary ? 'tag tag-primary' : 'tag'}>
                {name}
              </span>
            )
          })}
        </div>
      </section>

      {/* ===== 工作经历 ===== */}
      <section>
        <div className="sec-head">
          <span className="bracket">[Work]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {(t.raw('experience') as Experience[]).map((exp, index) => (
            <div key={index} style={{ display: 'flex', gap: 20, fontSize: 13 }}>
              <div
                style={{
                  width: 100,
                  flexShrink: 0,
                  color: 'var(--neon)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  paddingTop: 2,
                }}
              >
                {exp.period}
              </div>
              <div style={{ flex: 1, borderLeft: '2px solid rgba(255,255,255,.04)', paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{exp.role}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--cyan)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  @ {exp.company}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {exp.points.map((point, i) => (
                    <div key={i} style={{ color: 'rgba(255,255,255,.35)', lineHeight: 1.7, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,.1)', flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(t.raw('learningList') as string[]).map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
              <span
                style={{ color: 'var(--neon)', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, flexShrink: 0 }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item}</span>
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
            <div key={index} style={{ display: 'flex', gap: 20, fontSize: 13 }}>
              <div
                style={{
                  width: 100,
                  flexShrink: 0,
                  color: 'rgba(255,255,255,.2)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  paddingTop: 2,
                }}
              >
                {education.period}
              </div>
              <div style={{ borderLeft: '2px solid rgba(255,255,255,.04)', paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{education.school}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{education.degree}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
