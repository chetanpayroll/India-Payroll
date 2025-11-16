import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

export function formatMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return new Intl.DateFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let count = 0
  
  while (start <= end) {
    const dayOfWeek = start.getDay()
    // Count all days (UAE typically works Saturday-Thursday)
    // Excluding Friday only
    if (dayOfWeek !== 5) {
      count++
    }
    start.setDate(start.getDate() + 1)
  }
  
  return count
}

export function prorateAmount(
  amount: number,
  totalDays: number,
  workedDays: number
): number {
  return (amount / totalDays) * workedDays
}
