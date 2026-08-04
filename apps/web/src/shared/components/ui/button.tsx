/**
 * iOS 风格按钮
 *
 * 胶囊圆角、系统蓝主按钮、玻璃次按钮；按压时弹簧缩放。
 */

import { cn } from '@/src/shared/utils'
import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium',
          'transition-[transform,background-color,opacity] duration-200 active:scale-95',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          variant === 'primary' && 'btn btn-primary',
          variant === 'secondary' && 'btn btn-secondary',
          variant === 'ghost' && 'btn btn-ghost',
          variant === 'destructive' && 'btn btn-destructive',
          size === 'default' && 'h-10 px-6',
          size === 'sm' && 'h-8 px-4 text-sm',
          size === 'lg' && 'h-12 px-8 text-base',
          size === 'icon' && 'size-10',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
