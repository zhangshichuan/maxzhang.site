import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/src/features/chat'

export const Route = createFileRoute('/_en/chat')({
  component: ChatComponent,
  head: () => ({
    meta: [
      { title: 'Night Banquet - Max Zhang' },
      {
        name: 'description',
        content:
          'Dinner with fourteen great minds: talk one-on-one or open a round table. AI perspectives distilled from public material.',
      },
    ],
  }),
})

function ChatComponent() {
  return <ChatInterface />
}
