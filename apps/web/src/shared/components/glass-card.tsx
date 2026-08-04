/**
 * 液态玻璃卡片
 *
 * iOS 风格圆角玻璃卡片：半透明背景 + 背景模糊 + 高光边框，
 * 玻璃强度由全站外观变量统一控制。
 */

import { cn } from '@/src/shared/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return <div className={cn('glass-card', hoverEffect && 'glass-card-hover', className)}>{children}</div>
}
