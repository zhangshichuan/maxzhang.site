import { createFileRoute } from '@tanstack/react-router'
import { CasesPage } from '@/src/features/cases'

export const Route = createFileRoute('/_en/cases')({
  component: CasesPage,
  head: () => ({
    meta: [
      { title: 'Case Studies - Max Zhang' },
      {
        name: 'description',
        content:
          'Six AI product case studies — support, meeting notes, homework solver, companion, medical consultation and travel planner — with key judgments, workflows and evaluation.',
      },
    ],
  }),
})
