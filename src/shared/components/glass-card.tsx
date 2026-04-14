/**
 * 玻璃卡片组件
 *
 * 具有毛玻璃效果和动态交互的卡片组件
 * 使用Framer Motion实现悬停动画效果
 */

import { cn } from '@/src/shared/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

/** 玻璃卡片组件属性接口 */
interface GlassCardProps {
  children: ReactNode // 卡片内容
  className?: string // 自定义CSS类名
  hoverEffect?: boolean // 是否启用悬停效果
}

/**
 * 多巴胺卡片 (Dopamine Card)
 * 使用硬边框、实体阴影和动力学反馈。
 */
export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { x: -2, y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={cn(
        'bg-card text-card-foreground relative overflow-hidden rounded-[--radius]',
        'border-2 border-border transition-all duration-200',
        // 使用 CSS 变量中定义的实体阴影
        'shadow-(--shadow-pop)',
        hoverEffect && 'hover:bg-secondary/5 hover:shadow-(--shadow-pop-hover)',
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
