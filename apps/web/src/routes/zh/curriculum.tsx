import { createFileRoute } from '@tanstack/react-router'
import { CurriculumPage } from '@/src/features/curriculum'

export const Route = createFileRoute('/zh/curriculum')({
  component: CurriculumPage,
  head: () => ({
    meta: [
      { title: '知识地图 - Max Zhang' },
      {
        name: 'description',
        content:
          '把 13 周 AI 产品经理课程重构为 4 个阶段、13 张卡片：提示词、评测、RAG、Agent、需求、市场、数据与行业案例。',
      },
    ],
  }),
})
