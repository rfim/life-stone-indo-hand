import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'PPpp'): string {
  try {
    return format(new Date(date), formatStr)
  } catch {
    return 'Invalid Date'
  }
}
