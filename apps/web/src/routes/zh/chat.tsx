import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/zh/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [
      { title: '树洞 - Max Zhang' },
      { name: 'description', content: '一个 AI 倾听实验：用 DeepSeek 做的小实验，不评判，只倾听。' },
    ],
  }),
})

function ChatComponent() {
  return (
    <div className="chat-route">
      <ChatInterface />
    </div>
  )
}
