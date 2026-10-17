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
          'Six industry cases — AI support, meeting notes, homework solver, companion, medical consultation and travel planner — and the key judgments in each workflow.',
      },
    ],
  }),
})
