import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/zh/about')({
  component: AboutPage,
  head: () => ({
    meta: [{ title: '关于我 - Max Zhang' }, { name: 'description', content: 'Max Zhang 的个人介绍、技术栈与经历' }],
  }),
})
