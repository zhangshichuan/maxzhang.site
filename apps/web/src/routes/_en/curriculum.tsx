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
          'A 13-week AI product course restructured into 4 stages and 13 cards: prompting, evaluation, RAG, agents, research, markets, data and industry cases.',
      },
    ],
  }),
})
