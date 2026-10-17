import { createFileRoute } from '@tanstack/react-router'
import { CurriculumPage } from '@/src/features/curriculum'

export const Route = createFileRoute('/_en/curriculum')({
  component: CurriculumPage,
  head: () => ({
    meta: [
      { title: 'Knowledge Map - Max Zhang' },
      {
        name: 'description',
        content:
          'My AI product knowledge map: 4 stages, 13 modules — from model limits, prompting and evaluation to RAG, agents, research and industry rollout.',
      },
    ],
  }),
})
