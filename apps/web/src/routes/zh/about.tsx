import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/zh/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: '关于我 - Max Zhang' },
      {
        name: 'description',
        content: 'Max Zhang，AI 产品经理。前全栈工程师，关注 Agent、RAG 与 AI 产品落地。',
      },
    ],
  }),
})
