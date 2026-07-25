import { Footer } from '@/src/shared/components'
import { Navbar } from '@/src/shared/components'
import { ParticleCanvas } from '@/src/shared/components/particle-canvas'
import { routing } from '@/i18n/routing'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'

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
      <body>
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
