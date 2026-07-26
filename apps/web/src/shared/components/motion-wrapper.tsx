/**
 * 动画包装组件
 *
 * 使用Framer Motion封装的动画组件，提供淡入、交错动画等常用动画效果
 */

'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

/** 动画包装组件通用属性接口 */
interface WrapperProps {
  children: ReactNode // 子元素内容
  className?: string // 自定义CSS类名
  delay?: number // 动画延迟时间（秒）
}

/**
 * 淡入动画组件
 *
 * 元素从下方淡入显示，适用于页面加载时的平滑过渡效果
 *
 * @param children - 要动画显示的子元素
 * @param className - 自定义CSS类名
 * @param delay - 动画延迟时间（秒）
 * @returns 带有淡入动画的div元素
 */
export function FadeIn({ children, className, delay = 0 }: WrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画容器组件
 *
 * 控制子元素按照顺序依次显示，创建交错动画效果
 *
 * @param children - 要交错动画显示的子元素
 * @param className - 自定义CSS类名
 * @param delay - 整体动画延迟时间（秒）
 * @returns 控制子元素交错动画的容器
 */
export function StaggerContainer({ children, className, delay = 0 }: WrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画子项组件
 *
 * 配合StaggerContainer使用，定义单个子元素的动画效果
 *
 * @param children - 子元素内容
 * @param className - 自定义CSS类名
 * @returns 带有淡入动画的子项元素
 */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
