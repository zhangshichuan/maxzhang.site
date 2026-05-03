/**
 * 关于页面组件
 *
 * 杂志风格个人介绍页
 */

'use client'

import { Link } from '@/i18n/routing'
import { Briefcase, Github, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { FadeIn, GlassCard, StaggerContainer, StaggerItem } from '@/src/shared/components'
import { Button } from '@/src/shared/components/ui'
import Avatar from '../avatar.jpg'

interface Experience {
  role: string
  company: string
  department: string
  period: string
  tags: string[]
  points: string[]
}

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
        {/* 头像 */}
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

          <p className="font-serif text-lg/relaxed text-foreground/85">
            {t.rich('description', {
              primary: (chunks) => <span className="font-bold text-primary">{chunks}</span>,
              accent: (chunks) => <span className="font-bold text-accent">{chunks}</span>,
              secondary: (chunks) => (
                <span className="font-bold text-secondary underline decoration-secondary/30 decoration-2 underline-offset-4">
                  {chunks}
                </span>
              ),
            })}
          </p>

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

      <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
        {/* 左侧：工作经历 + 教育 */}
        <StaggerContainer className="space-y-12" delay={0.2}>
          <StaggerItem>
            <h2 className="mb-6 flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight">
              <Briefcase className="size-6 text-primary/70" /> {t('workExperience')}
            </h2>
            <GlassCard className="space-y-8 p-6 md:p-8" hoverEffect={false}>
              <div className="relative space-y-10 border-l-2 border-border/30 pl-6">
                {(t.raw('experience') as Experience[]).map((experience, index) => (
                  <div key={index} className="relative">
                    <span
                      className={`absolute top-1.5 -left-[29px] size-3 rounded-full border-2 border-card ${
                        index === 0 ? 'bg-primary' : 'bg-secondary'
                      }`}
                    />
                    <div className="mb-2 flex flex-col gap-1">
                      <h3 className="font-serif text-lg font-bold text-foreground">{experience.role}</h3>
                      <p className="font-serif text-sm text-muted-foreground italic">
                        {experience.company} &middot; {experience.department}
                      </p>
                      <p className="font-sans text-xs tracking-wide text-muted-foreground/70">{experience.period}</p>
                    </div>
                    <div className="my-3 flex flex-wrap gap-1.5">
                      {experience.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-sm border border-border/40 bg-muted/30 px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-3 space-y-2 font-serif text-sm/relaxed text-foreground/75">
                      {experience.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex gap-2">
                          <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/30" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <h2 className="mb-6 flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight">
              <GraduationCap className="size-6 text-accent/70" /> {t('education')}
            </h2>
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="relative space-y-8 border-l-2 border-border/30 pl-6">
                {(t.raw('educationList') as Education[]).map((education, index) => (
                  <div key={index} className="relative">
                    <span className="absolute top-1.5 -left-[29px] size-3 rounded-full border-2 border-card bg-accent" />
                    <h3 className="font-serif text-lg font-bold text-foreground">{education.school}</h3>
                    <p className="font-serif text-sm text-muted-foreground italic">{education.degree}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>

        {/* 右侧：技术栈 + 兴趣 */}
        <StaggerContainer className="space-y-8" delay={0.4}>
          <StaggerItem>
            <GlassCard className="p-6" hoverEffect={false}>
              <h3 className="mb-5 font-serif text-lg font-bold tracking-tight">{t('techStack')}</h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'TypeScript',
                  'Python',
                  'Tailwind CSS',
                  'Framer Motion',
                  'Artillery',
                  'PostgreSQL',
                  'Redis',
                  'Prisma',
                  'Zod',
                  'tRPC',
                  'APM',
                  'MQ',
                  'LLMOps',
                  'DevOps',
                  'LangChain',
                  'Dify',
                  'Taro',
                  'Flutter',
                  'React Native',
                  'Electron',
                ].map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-sm border border-border/40 bg-card px-2.5 py-1 font-sans text-[11px] font-medium tracking-wide text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard className="p-6" hoverEffect={false}>
              <h3 className="mb-5 font-serif text-lg font-bold tracking-tight">{t('interests')}</h3>
              <ul className="space-y-2.5">
                {(t.raw('interestList') as string[]).map((interest, index) => (
                  <li key={index} className="flex items-center gap-2.5 font-serif text-sm text-foreground/80">
                    <span
                      className={`size-2 rounded-full ${
                        index % 3 === 0 ? 'bg-primary/60' : index % 3 === 1 ? 'bg-accent/60' : 'bg-secondary/60'
                      }`}
                    />
                    {interest}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  )
}
