import { useTranslations } from 'next-intl'

export function Footer() {
	const t = useTranslations('Common.footer')
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t border-border/40 py-6 md:py-0">
			<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row max-w-screen-2xl mx-auto px-4">
				<p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
					{t.rich('builtBy', {
						name: (chunks) => (
							<a
								href="https://github.com/zhangshichuan"
								target="_blank"
								rel="noreferrer"
								className="font-medium underline underline-offset-4"
							>
								{chunks}
							</a>
						),
						year: currentYear,
					})}
				</p>
			</div>
		</footer>
	)
}
