/**
 * 纸质卡片组件
 *
 * 杂志风格的卡片组件，模拟纸张质感
 * 柔和阴影、微圆角、暖色边框
 */

import { cn } from '@/src/shared/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-[--radius] bg-card text-card-foreground',
        'border border-border/60',
        'shadow-(--shadow-card)',
        'transition-shadow duration-300',
        hoverEffect && 'hover:shadow-(--shadow-card-hover)',
        className,
      )}
    >
      {children}
    </div>
  )
}
