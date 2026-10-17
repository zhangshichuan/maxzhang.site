import { createFileRoute } from '@tanstack/react-router'
import { CurriculumPage } from '@/src/features/curriculum'

export const Route = createFileRoute('/zh/curriculum')({
  component: CurriculumPage,
  head: () => ({
    meta: [
      { title: '知识地图 - Max Zhang' },
      {
        name: 'description',
        content: '我的 AI 产品知识地图：4 个阶段、13 个模块，从模型边界、提示词与评测，到 RAG、Agent、需求与行业落地。',
      },
    ],
  }),
})
