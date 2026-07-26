/**
 * 按钮组件
 *
 * 杂志风格的优雅按钮，内敛而有质感
 */

import { cn } from '@/src/shared/utils'
import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground border border-primary/80 hover:bg-primary/90 active:bg-primary/80',
      destructive: 'bg-destructive text-destructive-foreground border border-destructive/80 hover:bg-destructive/90',
      outline: 'border border-border bg-card text-foreground hover:bg-muted/50 hover:border-primary/40',
      secondary: 'bg-secondary text-secondary-foreground border border-secondary/80 hover:bg-secondary/90',
      ghost: 'hover:bg-muted/50 text-foreground',
      link: 'text-primary underline-offset-4 hover:underline font-medium',
    }

    const sizes = {
      default: 'h-10 px-6 py-2',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-8 text-base',
      xl: 'h-14 px-10 text-xl',
      icon: 'h-10 w-10',
    }

    return (
      <button
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-md',
          'font-medium tracking-wide transition-all duration-200',
          'ring-offset-background',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
