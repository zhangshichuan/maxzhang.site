import type { Metadata } from 'next'
import '../globals.css'
import { ThemeProvider } from './providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>
}): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'Common' })

	return {
		title: t('title'),
		description: 'Personal website of Max Zhang',
		viewport: {
			width: 'device-width',
			initialScale: 1,
			viewportFit: 'cover',
		},
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

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound()
	}

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()

	return (
		<html lang={locale} className="scroll-pt-16" suppressHydrationWarning>
			<body className="flex min-h-screen flex-col pt-16 font-sans antialiased">
				<NextIntlClientProvider messages={messages}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Navbar />
						<main className="flex-1">
							{/* 静态滚动锚点：防止 Framer Motion 动画导致刷新时滚动条跳动 */}
							<div className="h-px w-full opacity-0" aria-hidden="true" />
							{children}
						</main>
						<Footer />
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
