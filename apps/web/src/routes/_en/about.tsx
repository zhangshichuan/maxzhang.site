import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/_en/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About Me - Max Zhang' },
      {
        name: 'description',
        content:
          'Max Zhang — full-stack engineer moving into AI product management, rebuilding product methods through a 13-week course, a knowledge map and industry case reviews.',
      },
    ],
  }),
})
