// lib/utils.ts - utility helpers for currency, date formatting, and payroll calculations

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number or numeric string into AED currency.
 * Returns a safe formatted string; invalid values return "AED 0.00".
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  const n = amount == null ? 0 : (typeof amount === 'string' ? parseFloat(amount) : Number(amount))
  const value = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a Date or ISO date string to 'DD Mon YYYY' (en-GB).
 * Returns '—' for undefined/invalid inputs.
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date) || isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

/**
 * Format a month/year into a readable string like "November 2024".
 * month is 1-12. Returns '—' for invalid inputs.
 */
export function formatMonth(month: number | undefined | null, year: number | undefined | null): string {
  if (!Number.isInteger(month) || !Number.isInteger(year)) return '—'
  // month is 1-12; JS Date months are 0-11
  const date = new Date(year, month - 1, 1)
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric'
  }).format(date)
}

/**
 * Calculate working days between two dates (inclusive).
 * By default excludes Friday (day 5) as non-working day for UAE.
 * Accepts Date or date-like inputs; returns 0 for invalid dates.
 */
export function calculateWorkingDays(startDateInput: Date | string, endDateInput: Date | string, excludeFriday = true): number {
  const start = (typeof startDateInput === 'string') ? new Date(startDateInput) : new Date(startDateInput)
  const end = (typeof endDateInput === 'string') ? new Date(endDateInput) : new Date(endDateInput)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  // Normalize times to midnight to avoid DST issues
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  if (end < start) return 0

  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const dayOfWeek = cur.getDay() // 0 = Sun ... 5 = Fri ... 6 = Sat
    // In UAE typical weekend is Friday; counting rules vary by org.
    if (excludeFriday) {
      if (dayOfWeek !== 5) count++
    } else {
      count++
    }
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

/**
 * Simple prorate calculation: proportionally scales amount.
 * Returns 0 if inputs are invalid.
 */
export function prorateAmount(amount: number | string, totalDays: number, workedDays: number): number {
  const amt = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  const a = Number.isFinite(amt) ? amt : 0
  const td = Number.isFinite(Number(totalDays)) && Number(totalDays) > 0 ? Number(totalDays) : 0
  const wd = Number.isFinite(Number(workedDays)) && Number(workedDays) >= 0 ? Number(workedDays) : 0
  if (td <= 0) return 0
  return (a / td) * wd
}
