import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import escapeHtml from 'escape-html'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { escapeHtml }
