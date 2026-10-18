import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/zh/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: '关于 — Max Zhang' },
      {
        name: 'description',
        content: 'Max Zhang，AI 产品经理。十年全栈工程，现在做 AI 产品。',
      },
    ],
  }),
})
