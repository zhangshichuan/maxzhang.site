import { createFileRoute } from '@tanstack/react-router'
import { CasesPage } from '@/src/features/cases'

export const Route = createFileRoute('/zh/cases')({
  component: CasesPage,
  head: () => ({
    meta: [
      { title: '实战案例 - Max Zhang' },
      {
        name: 'description',
        content:
          '六个 AI 产品行业案例：智能客服、会议纪要、拍照搜题、AI 陪伴、AI 问诊、旅游规划师，记录关键判断、工作流与评测口径。',
      },
    ],
  }),
})
