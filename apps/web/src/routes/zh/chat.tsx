import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/zh/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [{ title: '聊天 - Max Zhang' }],
  }),
})

function ChatComponent() {
  return (
    <div style={{ padding: '40px 0', maxWidth: 700, margin: '0 auto' }}>
      <ChatInterface />
    </div>
  )
}
