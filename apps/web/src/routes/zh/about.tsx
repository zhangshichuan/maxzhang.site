import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/zh/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: '关于我 - Max Zhang' },
      {
        name: 'description',
        content: 'Max Zhang，十年全栈工程师转 AI 产品经理。以一套 13 周课程重建产品方法论，做知识地图与行业案例复盘。',
      },
    ],
  }),
})
