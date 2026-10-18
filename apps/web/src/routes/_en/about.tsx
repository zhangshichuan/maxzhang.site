import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/_en/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About Me - Max Zhang' },
      {
        name: 'description',
        content: 'AI Product Manager and former full-stack engineer, writing about AI products, agents, and evaluation.',
      },
    ],
  }),
})
