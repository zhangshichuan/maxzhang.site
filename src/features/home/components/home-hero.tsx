'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/src/shared/components'
import { Button } from '@/src/shared/components/ui'
import { BookOpen, Loader2, User } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

const tagline = ['Build', 'with', 'Purpose.', 'Power', 'with', 'AI.']

export function HomeHero() {
  const t = useTranslations('HomePage.hero')
  const router = useRouter()
  const [postsLoading, setPostsLoading] = useState(false)
  const [aboutLoading, setAboutLoading] = useState(false)

  const handlePostsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setPostsLoading(true)
    router.push('/posts')
  }

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setAboutLoading(true)
    router.push('/about')
  }

  return (
    <section className="relative flex flex-col items-center gap-10 pt-12 md:pt-20 lg:pt-28">
      {/* 装饰性顶线 */}
      <div className="ornament-divider w-full max-w-md">&#9670;</div>

      <div className="flex flex-col items-center gap-6 text-center">
        {/* 杂志刊头 */}
        <FadeIn delay={0.1}>
          <p className="font-sans text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
            {new Date().getFullYear()} &middot; Personal Journal
          </p>
        </FadeIn>

        <h1 className="max-w-full text-5xl leading-[1.15] font-bold tracking-tight text-foreground sm:text-7xl xl:text-8xl/none">
          <motion.span
            className="inline-block font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            Max Zhang
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-px w-16 bg-border" />
          <p className="max-w-lg font-serif text-xl/relaxed text-muted-foreground italic md:text-2xl">
            {tagline.map((word, i) => (
              <motion.span
                key={word + i}
                className="inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.06, duration: 0.4 }}
              >
                {word}
                {i < tagline.length - 1 ? '\u00A0' : ''}
              </motion.span>
            ))}
          </p>
          <div className="h-px w-16 bg-border" />
        </motion.div>
      </div>

      {/* CTA 按钮 */}
      <FadeIn className="flex flex-wrap items-center gap-4" delay={1}>
        <Link href="/posts" onClick={handlePostsClick}>
          <Button size="lg" className="gap-2 font-serif text-base" disabled={postsLoading}>
            {postsLoading ? <Loader2 className="size-4 animate-spin" /> : <BookOpen className="size-4" />}
            {t('readArticles')}
          </Button>
        </Link>
        <Link href="/about" onClick={handleAboutClick}>
          <Button variant="outline" size="lg" className="gap-2 font-serif text-base" disabled={aboutLoading}>
            {aboutLoading ? <Loader2 className="size-4 animate-spin" /> : <User className="size-4" />}
            {t('aboutMe')}
          </Button>
        </Link>
      </FadeIn>

      {/* 底部装饰线 */}
      <div className="ornament-divider w-full max-w-md">&#9670;</div>
    </section>
  )
}
