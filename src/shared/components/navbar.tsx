/**
 * 导航栏组件
 *
 * 杂志风格顶部导航栏，简洁优雅
 */

'use client'

import { Link, usePathname, useRouter } from '@/i18n/routing'
import { ThemeToggle } from '@/src/shared/components'
import { cn } from '@/src/shared/utils'
import { Languages, Menu, Search, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import * as React from 'react'

export function Navbar() {
  const t = useTranslations('Common.nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navItems = [
    { name: t('home'), path: '/' },
    { name: t('posts'), path: '/posts' },
    { name: t('about'), path: '/about' },
  ]

  const toggleLanguage = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-6 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
            <span className="hidden md:inline">Max Zhang</span>
            <span className="md:hidden">Max</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="ml-12 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'nav-underline px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200',
                pathname === item.path ? 'active text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex flex-1 items-center justify-end gap-1">
          <Link
            href="/search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="size-5" />
            <span className="sr-only">搜索</span>
          </Link>

          <button
            onClick={toggleLanguage}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={t('switchLanguage')}
          >
            <Languages className="size-5" />
            <span className="sr-only">语言</span>
          </button>

          <ThemeToggle className="h-9 w-9 cursor-pointer rounded-md text-muted-foreground transition-colors hover:bg-muted" />

          {/* Mobile Menu Toggle */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-border/40 bg-card md:hidden">
          <div className="container space-y-1 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'block rounded-md px-4 py-3 text-base font-medium transition-colors',
                  pathname === item.path
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
