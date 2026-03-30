import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import escapeHtml from 'escape-html'

/**
 * 合并 Tailwind CSS 类名
 * 优先使用 tailwind-merge 合并重复的类名
 * @param inputs - 类名参数
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 */
export { escapeHtml }
