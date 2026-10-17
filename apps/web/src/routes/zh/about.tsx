import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/zh/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: '关于我 - Max Zhang' },
      {
        name: 'description',
        content: 'Max Zhang，10 年以上全栈经验的 AI 产品经理。知识地图、六个行业案例与工程交付记录。',
      },
    ],
  }),
})
