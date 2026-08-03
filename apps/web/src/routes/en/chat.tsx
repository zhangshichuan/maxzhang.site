import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/en/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [{ title: 'Chat - Max Zhang' }],
  }),
})

function ChatComponent() {
  return (
    <div style={{ padding: '40px 0', maxWidth: 700, margin: '0 auto' }}>
      <ChatInterface />
    </div>
  )
}
