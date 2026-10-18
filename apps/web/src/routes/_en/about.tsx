import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/_en/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About — Max Zhang' },
      {
        name: 'description',
        content: 'Max Zhang — AI Product Manager with ten years of full-stack engineering.',
      },
    ],
  }),
})
