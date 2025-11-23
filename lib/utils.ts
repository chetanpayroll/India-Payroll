// lib/utils.ts - utility helpers for currency, date formatting, and payroll calculations

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @deprecated This function is deprecated and should not be used.
 * Use the useCurrencyFormatter() hook instead to get context-aware currency formatting.
 *
 * This function returns a neutral number format without currency symbol.
 * For proper currency display that respects the selected country module, use:
 *
 * @example
 * ```tsx
 * import { useCurrencyFormatter } from '@/lib/hooks/use-currency-formatter';
 *
 * function MyComponent() {
 *   const formatCurrency = useCurrencyFormatter(); // This will format as INR or AED based on selected country
 *   return <div>{formatCurrency(1000)}</div>;
 * }
 * ```
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  const n = amount == null ? 0 : (typeof amount === 'string' ? parseFloat(amount) : Number(amount))
  const value = Number.isFinite(n) ? n : 0
  // Return neutral format - use useCurrencyFormatter() hook for country-specific formatting
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
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
  // Narrow types explicitly for TypeScript
  if (month == null || year == null) return '—'
  if (typeof month !== 'number' || typeof year !== 'number') return '—'
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

/**
 * Generate a unique ID for database records
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Round number to 2 decimal places (for currency calculations)
 */
export function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get days in a specific month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format IBAN for display (with spaces)
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Validate UAE Emirates ID format (784-YYYY-NNNNNNN-N)
 */
export function validateEmiratesID(emiratesId: string): boolean {
  const regex = /^784-\d{4}-\d{7}-\d$/;
  return regex.test(emiratesId);
}

/**
 * Validate UAE IBAN format
 */
export function validateIBAN(iban: string): boolean {
  // Remove spaces
  const cleanIban = iban.replace(/\s/g, '');
  // UAE IBAN: AE + 2 check digits + 3 bank code + 16 account number = 23 chars
  const regex = /^AE\d{21}$/;
  return regex.test(cleanIban);
}

/**
 * Calculate years of service
 */
export function calculateYearsOfService(joiningDate: Date | string): {
  years: number;
  months: number;
  days: number;
  totalYears: number;
} {
  const start = typeof joiningDate === 'string' ? new Date(joiningDate) : joiningDate;
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    days += getDaysInMonth(now.getFullYear(), now.getMonth());
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalYears = years + months / 12 + days / 365;

  return { years, months, days, totalYears };
}
