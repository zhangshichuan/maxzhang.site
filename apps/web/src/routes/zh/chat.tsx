import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/zh/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [{ title: '树洞 - Max Zhang' }],
  }),
})

function ChatComponent() {
  return (
    <div className="chat-route">
      <ChatInterface />
    </div>
  )
}
