import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/_en/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [{ title: 'Fortune Chat - Max Zhang' }],
  }),
})

function ChatComponent() {
  return (
    <div style={{ padding: '40px 0', maxWidth: 700, margin: '0 auto' }}>
      <ChatInterface />
    </div>
  )
}
