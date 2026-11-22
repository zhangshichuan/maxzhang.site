import { cn } from '@/src/shared/utils/cn'
import type { Guest } from '../model/guests'

type GuestMarkProps = {
  guest: Guest
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'ch-mark--sm',
  md: 'ch-mark--md',
  lg: 'ch-mark--lg',
} as const

/** 宾客的方形字标：不用头像，保持仪表盘的排印感。 */
export function GuestMark({ guest, size = 'md', className }: GuestMarkProps) {
  return (
    <span className={cn('ch-mark', sizeClass[size], className)} aria-hidden="true">
      {guest.initials}
    </span>
  )
}
