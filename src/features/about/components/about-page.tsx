'use client'

import { Link } from '@/i18n/routing'
import { Github, Mail, Linkedin, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Avatar from '../avatar.jpg'

interface Education {
  school: string
  period: string
  degree: string
}

export function AboutPage() {
  const t = useTranslations('AboutPage')

  return (
    <div>
      {/* 个人信息 */}
      <div style={{ display: 'flex', gap: 40, marginBottom: 60, alignItems: 'flex-start' }}>
        <div style={{ width: 120, height: 120, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          <Image src={Avatar} alt="Max Zhang" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }} priority />
        </div>

        <div style={{ flex: 1 }}>
          <div className="tagline" style={{ marginBottom: 8 }}>{t('role')}</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, marginBottom: 8, color: '#fff' }}>Max Zhang</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin style={{ width: 14, height: 14, color: 'var(--neon)' }} /> {t('location')}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,.5)', maxWidth: 560 }}>{t('description')}</p>

          <div className="btn-group" style={{ marginTop: 20 }}>
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

      {/* 技术栈 */}
      <section style={{ padding: '40px 0' }}>
        <div className="sec-head">
          <span className="bracket">[Tech stack]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { name: 'TypeScript', primary: true },
            { name: 'Python', primary: true },
            { name: 'FastAPI' },
            { name: 'Next.js' },
            { name: 'PostgreSQL' },
            { name: 'Redis' },
            { name: 'Docker' },
            { name: 'Prisma' },
            { name: 'Playwright' },
            { name: 'MCP', primary: true },
            { name: 'A2A', primary: true },
            { name: 'ReAct', primary: true },
            { name: 'LangChain' },
            { name: 'Dify' },
            { name: 'LLMOps' },
            { name: 'DevOps' },
            { name: 'Taro' },
            { name: 'Flutter' },
            { name: 'React Native' },
            { name: 'Electron' },
          ].map(({ name, primary }) => (
            <span
              key={name}
              className="tag"
              style={primary ? { borderColor: 'rgba(255,45,149,.4)', color: 'var(--neon)' } : undefined}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* 研习方向 */}
      <section style={{ padding: '40px 0' }}>
        <div className="sec-head">
          <span className="bracket">[Learning]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(t.raw('learningList') as string[]).map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
              <span style={{ color: 'var(--neon)', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 教育经历 */}
      <section style={{ padding: '40px 0' }}>
        <div className="sec-head">
          <span className="bracket">[Education]</span>
          <div className="line"></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(t.raw('educationList') as Education[]).map((education, index) => (
            <div key={index} style={{ borderLeft: '2px solid rgba(255,255,255,.06)', paddingLeft: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{education.school}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{education.degree}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
