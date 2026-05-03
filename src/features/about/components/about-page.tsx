/**
 * 关于页面组件
 *
 * 杂志风格个人介绍页 — 左侧主栏（技术栈+研习）+ 右侧边栏（教育+兴趣）
 */

'use client'

import { Link } from '@/i18n/routing'
import { BookOpen, Github, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { FadeIn, StaggerContainer, StaggerItem } from '@/src/shared/components'
import { Button } from '@/src/shared/components/ui'
import Avatar from '../avatar.jpg'

interface Education {
  school: string
  period: string
  degree: string
}

export function AboutPage() {
  const t = useTranslations('AboutPage')

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10 md:px-8">
      <FadeIn className="mb-16 flex flex-col items-start gap-10 md:flex-row">
        <div className="group relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border/40 bg-muted/30 md:size-44">
          <Image src={Avatar} alt="Max Zhang" className="object-cover grayscale-30" priority />
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <p className="font-sans text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              {t('role')}
            </p>
            <h1 className="mt-1 mb-2 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Max Zhang
            </h1>
            <p className="flex items-center gap-1.5 font-serif text-base text-muted-foreground italic">
              <MapPin className="size-4 text-primary/60" /> {t('location')}
            </p>
          </div>

          <p className="font-serif text-lg/relaxed whitespace-pre-line text-foreground/85">{t('description')}</p>

          <div className="flex flex-wrap gap-3">
            <Link href="https://github.com/zhangshichuan" target="_blank">
              <Button variant="outline" size="sm" className="gap-2 font-serif">
                <Github className="size-4" /> GitHub
              </Button>
            </Link>
            <Link href="mailto:zsc.guru@qq.com">
              <Button variant="outline" size="sm" className="gap-2 font-serif">
                <Mail className="size-4" /> Email
              </Button>
            </Link>
            <Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
              <Button variant="outline" size="sm" className="gap-2 font-serif">
                <Linkedin className="size-4" /> LinkedIn
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* 分隔装饰线 */}
      <div className="ornament-divider mb-12">&#9670;</div>

      {/* 单列流式布局 */}
      <StaggerContainer className="max-w-2xl space-y-12" delay={0.2}>
        {/* 技术栈 */}
        <StaggerItem>
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">{t('techStack')}</h3>
            <div className="flex flex-wrap gap-2">
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
                  className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-sans text-[11px] font-medium tracking-wide transition-colors ${
                    primary
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-border/30 text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* 研习方向 */}
        <StaggerItem>
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold tracking-tight text-foreground">
              <BookOpen className="size-5 text-primary/60" />
              {t('learning')}
            </h3>
            <ul className="space-y-3">
              {(t.raw('learningList') as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-3 font-serif text-sm/relaxed text-foreground/80">
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>

        {/* 教育经历 */}
        <StaggerItem>
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold tracking-tight text-foreground">
              <GraduationCap className="size-5 text-accent/70" />
              {t('education')}
            </h3>
            <div className="space-y-4">
              {(t.raw('educationList') as Education[]).map((education, index) => (
                <div key={index} className="relative border-l-2 border-border/30 pl-4">
                  <h4 className="font-serif text-sm font-bold text-foreground">{education.school}</h4>
                  <p className="mt-0.5 font-serif text-xs text-muted-foreground italic">{education.degree}</p>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  )
}
