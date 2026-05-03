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
    <div className="container mx-auto max-w-3xl px-6 md:px-8">
      <div className="flex h-[calc(100vh-4rem-6rem)] flex-col py-10">
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
