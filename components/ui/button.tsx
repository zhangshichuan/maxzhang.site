import { cn } from '@/lib/utils'
import * as React from 'react'

// 需要安装 class-variance-authority 和 @radix-ui/react-slot
// 这里为了简化，我们先用基础实现，如果需要更复杂的 variant，我可以引入 cva

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'default', size = 'default', ...props }, ref) => {
		// 简化的 variant 映射
		const variants = {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
			outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline',
		}

		const sizes = {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 rounded-md px-3',
			lg: 'h-11 rounded-md px-8',
			icon: 'h-10 w-10',
		}

		return (
			<button
				className={cn(
					'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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
