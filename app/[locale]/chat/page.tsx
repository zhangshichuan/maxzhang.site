import { ChatInterface } from '@/src/features/chat'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Chat' })

  return {
    title: `${t('title')} - Max Zhang`,
    description: 'Chat with me',
  }
}

export default async function ChatPage() {
  return (
    <div style={{ padding: '40px 0', maxWidth: 700, margin: '0 auto' }}>
      <ChatInterface />
    </div>
  )
}
