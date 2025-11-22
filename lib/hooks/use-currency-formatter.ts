'use client';

import { useCountry } from '@/lib/context/CountryContext';
import { formatCurrencyForCountry } from '@/lib/payroll/core/countryConfig';

/**
 * useCurrencyFormatter hook
 *
 * Returns a currency formatter function that automatically uses the selected country's currency.
 * Falls back to AED if no country is selected.
 *
 * @example
 * ```tsx
 * const formatCurrency = useCurrencyFormatter();
 * console.log(formatCurrency(1000)); // "INR 1,000.00" or "AED 1,000.00" based on selected country
 * ```
 */
export function useCurrencyFormatter() {
  const { country, countryConfig } = useCountry();

  return (amount: number | string | undefined | null): string => {
    const n = amount == null ? 0 : (typeof amount === 'string' ? parseFloat(amount) : Number(amount));
    const value = Number.isFinite(n) ? n : 0;

    // If country is selected, use country-specific formatter
    if (country && countryConfig) {
      return formatCurrencyForCountry(value, country);
    }

    // Fallback: Try to get country from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gmppayroll_selected_country');
      if (stored && (stored === 'INDIA' || stored === 'UAE')) {
        return formatCurrencyForCountry(value, stored as 'INDIA' | 'UAE');
      }
    }

    // Final fallback to neutral format (no country selected)
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
}

/**
 * useCurrencySymbol hook
 *
 * Returns the currency symbol for the selected country.
 * Falls back to 'AED' if no country is selected.
 *
 * @example
 * ```tsx
 * const currencySymbol = useCurrencySymbol();
 * console.log(currencySymbol); // "INR" or "AED" based on selected country
 * ```
 */
export function useCurrencySymbol(): string {
  const { countryConfig } = useCountry();

  if (countryConfig?.currency) {
    return countryConfig.currency;
  }

  // Fallback: Try to get country from localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('gmppayroll_selected_country');
    if (stored === 'INDIA') return 'INR';
    if (stored === 'UAE') return 'AED';
  }

  // Final fallback to empty string
  return '';
}
