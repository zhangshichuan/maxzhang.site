/**
 * 主题切换组件
 *
 * 允许用户在明暗主题之间切换，使用Framer Motion实现平滑动画效果
 */

'use client'

import { cn } from '@/src/shared/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

/**
 * 主题切换按钮组件
 *
 * @param className - 自定义CSS类名
 * @returns 渲染主题切换按钮，根据当前主题显示太阳或月亮图标
 */
export function ThemeToggle({ className }: { className?: string }) {
  // 使用next-themes获取和设置主题
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // 避免水合不匹配
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn('h-10 w-10 rounded-full border-2 border-border/10', className)} />
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, rotate: 15 }}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        `
      relative inline-flex h-10 w-10 items-center justify-center overflow-hidden
      rounded-full border-2 border-border transition-colors
    `,
        `
      bg-background shadow-[2px_2px_0px_var(--border)]
      hover:bg-secondary/20
      active:translate-px active:shadow-none
    `,
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ y: 20, rotate: 90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Moon className="size-5 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, rotate: 90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Sun className="size-5 text-secondary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">切换主题</span>
    </motion.button>
  )
}
