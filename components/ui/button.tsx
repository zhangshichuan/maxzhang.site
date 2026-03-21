import { cn } from '@/lib/utils'
import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
	size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'default', size = 'default', ...props }, ref) => {
		// 多巴胺变体映射
		const variants = {
			default: 'bg-primary text-primary-foreground border-2 border-border shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
			destructive: 'bg-destructive text-destructive-foreground border-2 border-border shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-destructive/90 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
			outline: 'border-2 border-border bg-background hover:bg-secondary/20 shadow-[4px_4px_0px_var(--muted)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
			secondary: 'bg-secondary text-secondary-foreground border-2 border-border shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
			ghost: 'hover:bg-secondary/20 hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline font-black',
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
					`
       inline-flex cursor-pointer items-center justify-center rounded-xl
       font-black tracking-tight whitespace-nowrap uppercase
       ring-offset-background transition-all
       focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
       focus-visible:outline-none
       disabled:pointer-events-none disabled:opacity-50
     `,
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
