import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/zh/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [
      { title: '夜宴 - Max Zhang' },
      {
        name: 'description',
        content: '和十四位伟大头脑吃一顿晚饭：选一位对谈，或选多位开一桌。基于公开资料提炼的 AI 视角。',
      },
    ],
  }),
})

function ChatComponent() {
  return <ChatInterface />
}
