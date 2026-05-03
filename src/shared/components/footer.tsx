/**
 * 页脚组件
 *
 * 杂志风格底部，装饰性分隔线与优雅排版
 */

import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('Common.footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 py-8 md:py-6">
      <div className="container mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-6 md:h-20 md:flex-row md:px-8">
        <div className="ornament-divider w-full text-muted-foreground/30 md:hidden">&#9670;</div>
        <p className="text-center font-serif text-sm tracking-wide text-muted-foreground md:text-left">
          {t.rich('builtBy', {
            name: (chunks) => (
              <a
                href="https://github.com/zhangshichuan"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary/80 underline decoration-dotted underline-offset-4 hover:text-primary"
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
