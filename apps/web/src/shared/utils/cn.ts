/**
 * CSS类名工具函数
 *
 * 合并和条件化CSS类名，特别针对Tailwind CSS优化
 * 结合clsx的条件类和twMerge的Tailwind类名去重
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并多个CSS类名，处理条件类和Tailwind类名冲突
 *
 * @param inputs - 类名参数，可以是字符串、对象、数组等
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
