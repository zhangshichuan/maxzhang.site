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
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <FadeIn className="mb-16 flex flex-col items-start gap-10 md:flex-row">
        <div
          className="
      group relative flex size-32 shrink-0 items-center justify-center
      overflow-hidden rounded-full border-4 border-border bg-secondary
      shadow-[8px_8px_0px_var(--primary)] transition-transform
      hover:scale-105
      md:size-48
    "
        >
          <div className="absolute inset-0 z-10 bg-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <Image src={Avatar} alt="Max Zhang" className="rounded-full object-cover" priority />
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="mb-2 text-5xl font-black tracking-tight text-foreground">Max Zhang</h1>
            <p className="flex items-center gap-2 text-xl font-bold text-primary">
              <Briefcase className="size-5" /> {t('role')}
            </p>
            <p className="mt-1 flex items-center gap-2 font-medium text-muted-foreground">
              <MapPin className="size-4" /> {t('location')}
            </p>
          </div>

          <p className="text-xl/relaxed font-medium text-foreground/90">
            {t.rich('description', {
              primary: (chunks) => <span className="font-black text-primary">{chunks}</span>,
              accent: (chunks) => <span className="font-black text-accent">{chunks}</span>,
              secondary: (chunks) => (
                <span className="font-black text-secondary underline decoration-secondary/30 decoration-4 underline-offset-4">
                  {chunks}
                </span>
              ),
            })}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="https://github.com/zhangshichuan" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="size-4" /> GitHub
              </Button>
            </Link>
            <Link href="mailto:zsc.guru@qq.com">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="size-4" /> Email
              </Button>
            </Link>
            <Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Linkedin className="size-4" /> LinkedIn
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
        <StaggerContainer className="space-y-12" delay={0.2}>
          <StaggerItem>
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-black">
              <Briefcase className="h-8 w-8 text-primary" /> {t('workExperience')}
            </h2>
            <GlassCard className="space-y-8 p-8" hoverEffect={false}>
              <div className="relative space-y-12 border-l-4 border-border/30 pl-8">
                {(t.raw('experience') as Experience[]).map((experience, index) => (
                  <div key={index} className="relative">
                    <span
                      className={`
             absolute top-1 -left-9.5 size-6 rounded-full border-4
             border-background shadow-[2px_2px_0px_#000]
             ${index === 0 ? `bg-primary` : `bg-secondary`}
           `}
                    />
                    <div className="mb-2 flex flex-col">
                      <h3 className="text-xl font-black text-foreground">
                        {experience.role} • {experience.company}
                      </h3>
                      <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                        {experience.department} • {experience.period}
                      </p>
                    </div>
                    <div className="my-3 flex flex-wrap gap-2">
                      {experience.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`
               rounded-lg border-2 px-3 py-1 text-xs font-black
               shadow-[2px_2px_0px_rgba(0,0,0,0.1)]
               ${index === 0 ? `border-primary/20 bg-primary/10` : `border-secondary/20 bg-secondary/10`}
             `}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-4 ml-4 list-outside list-disc space-y-3 text-base font-medium text-foreground/80">
                      {experience.points.map((point, pointIndex) => (
                        <li key={pointIndex}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-black">
              <GraduationCap className="h-8 w-8 text-accent" /> {t('education')}
            </h2>
            <GlassCard className="p-8" hoverEffect={false}>
              <div className="relative space-y-8 border-l-4 border-border/30 pl-8">
                {(t.raw('educationList') as Education[]).map((education, index) => (
                  <div key={index} className="relative">
                    <span className="absolute top-1 -left-9.5 size-6 rounded-full border-4 border-background bg-accent shadow-[2px_2px_0px_#000]" />
                    <h3 className="text-xl font-black text-foreground">{education.school}</h3>
                    <p className="font-bold tracking-wider text-muted-foreground uppercase">{education.degree}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="space-y-8" delay={0.4}>
          <StaggerItem>
            <GlassCard className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-black">{t('techStack')}</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'TypeScript',
                  'Python',
                  'Go',
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
                  'Tauri',
                ].map((skill) => (
                  <span
                    key={skill}
                    className="
            bg-card inline-flex items-center rounded-xl border-2 border-border
            px-3 py-1.5 text-xs font-black text-foreground
            shadow-[2px_2px_0px_var(--border)] transition-all
            hover:translate-px hover:shadow-none
          "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-black">{t('interests')}</h3>
              <ul className="space-y-3 text-base font-bold text-muted-foreground">
                {t.raw('interestList').map((interest: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span
                      className={`
             size-2 rounded-full
             ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? `bg-accent` : `bg-secondary`}
           `}
                    />{' '}
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
