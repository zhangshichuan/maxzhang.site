import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/zh/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: '关于 — Max Zhang' },
      {
        name: 'description',
        content: 'Max Zhang，Product-minded AI builder，常驻成都。十年产品构建经验，专注 AI 产品、工作流与评测。',
      },
    ],
  }),
})
