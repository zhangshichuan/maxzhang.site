import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/_en/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [{ title: 'Tree Hole - Max Zhang' }],
  }),
})

function ChatComponent() {
  return (
    <div className="chat-route">
      <ChatInterface />
    </div>
  )
}
