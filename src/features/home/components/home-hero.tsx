'use client'

import { motion } from 'framer-motion'
import { FadeIn } from '@/src/shared/components'
import { Button } from '@/src/shared/components/ui'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

const tagline = ['Build', 'with', 'Purpose.', 'Power', 'with', 'AI.']

export function HomeHero() {
  const t = useTranslations('HomePage.hero')

  return (
    <section
      className="
    relative flex flex-col items-start gap-8 pt-10
    md:pt-20
    lg:pt-32
  "
    >
      {/* 浮动勋章 */}
      <FadeIn delay={0.1}>
        <div
          className="
     absolute -top-4 right-10 hidden rotate-12
     lg:block
   "
        >
          <div className="group relative">
            <div
              className="
       absolute inset-0 rounded-2xl bg-accent shadow-[4px_4px_0px_#000]
       transition-transform duration-500
       group-hover:rotate-6
     "
            ></div>
            <div
              className="
       relative flex items-center gap-2 rounded-2xl border-2 border-border
       bg-secondary p-4
     "
            >
              <Sparkles className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-sm font-black tracking-widest uppercase">Available for Hire</span>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="flex max-w-full flex-col gap-4">
        <h1
          className="
      max-w-full text-4xl leading-[1.2] font-black tracking-tight text-foreground
      sm:text-6xl
      xl:text-8xl/none
    "
        >
          <motion.span
            className="inline-block"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            Hi, I&apos;m{' '}
          </motion.span>
          <motion.span
            className="hero-name-shimmer inline-block pb-3.5"
            initial={{ scale: 0.85, opacity: 0, filter: 'blur(4px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Max Zhang
          </motion.span>
        </h1>

        <motion.p
          className="
      max-w-180 leading-relaxed font-medium text-muted-foreground
      md:text-2xl
    "
          initial="hidden"
          animate="visible"
          aria-label="Build with Purpose. Power with AI."
        >
          {tagline.map((word, i) => (
            <motion.span
              key={word + i}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 16, rotateX: -15 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.6 + i * 0.08,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                },
              }}
            >
              {word}
              {i < tagline.length - 1 ? '\u00A0' : ''}
            </motion.span>
          ))}
          <motion.span
            className="hero-cursor mt-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.3 }}
            aria-hidden="true"
          />
        </motion.p>
      </div>

      <FadeIn className="flex flex-wrap gap-6" delay={1.2}>
        <Link href="/posts">
          <Button size="xl" className="cursor-pointer bg-primary text-lg font-black">
            {t('readArticles')} {/* HomePage/hero/readArticles 阅读文章 */} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/about">
          <Button
            variant="outline"
            size="xl"
            className="
        cursor-pointer border-2 border-border text-lg font-black
        shadow-[6px_6px_0px_var(--muted)]
      "
          >
            {t('aboutMe')} {/* HomePage/hero/aboutMe 关于我 */}
          </Button>
        </Link>
      </FadeIn>
    </section>
  )
}
