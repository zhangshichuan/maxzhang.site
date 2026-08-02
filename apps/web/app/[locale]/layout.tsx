import { Footer } from '@/src/shared/components'
import { Navbar } from '@/src/shared/components'
import { ParticleCanvas } from '@/src/shared/components/particle-canvas'
import { routing } from '@/i18n/routing'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'

// DESIGN.md D5：正文 Inter，标签/标题 JetBrains Mono — 自托管保证所有设备一致
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jb-mono', display: 'swap' })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Common' })

  return {
    title: t('title'),
    description: 'Personal website of Max Zhang',
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ParticleCanvas />
        <div className="overlay">
          <div className="container">
            <NextIntlClientProvider messages={messages}>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </NextIntlClientProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
