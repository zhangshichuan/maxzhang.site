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
          'Max Zhang — AI Product Manager with 10+ years of full-stack engineering. Knowledge map, six industry cases and delivery record.',
      },
    ],
  }),
})
