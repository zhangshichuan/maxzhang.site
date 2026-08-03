import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/src/features/about'

export const Route = createFileRoute('/en/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About Me - Max Zhang' },
      { name: 'description', content: "Max Zhang's profile, tech stack and experience" },
    ],
  }),
})
