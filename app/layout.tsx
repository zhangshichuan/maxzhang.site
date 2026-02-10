import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BackgroundOrbs } from '@/components/background-orbs'

export const metadata: Metadata = {
	title: 'Max Zhang',
	description: 'Personal website of Max Zhang',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased min-h-screen flex flex-col font-sans">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<BackgroundOrbs />
					<Navbar />
					<main className="flex-1">
						{children}
					</main>
					<Footer />
				</ThemeProvider>
			</body>
		</html>
	)
}
