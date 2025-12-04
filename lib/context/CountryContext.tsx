'use client';

// ============================================================================
// COUNTRY CONTEXT - MULTI-COUNTRY PAYROLL SYSTEM
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CountryCode } from '../payroll/core/types';
import { COUNTRY_CONFIGS, CountryConfig } from '../payroll/core/countryConfig';

// ============================================================================
// TYPES
// ============================================================================

interface CountryContextType {
  // Current selected country
  country: CountryCode | null;
  countryConfig: CountryConfig | null;

  // Actions
  setCountry: (country: CountryCode) => void;
  clearCountry: () => void;

  // State
  isLoading: boolean;
  isCountrySelected: boolean;

  // Helpers
  getSupportedCountries: () => Array<{
    code: CountryCode;
    name: string;
    flag: string;
    currency: string;
  }>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CountryContext = createContext<CountryContextType | undefined>(undefined);

// Storage key for persisting country selection
const COUNTRY_STORAGE_KEY = 'gmppayroll_selected_country';

// ============================================================================
// PROVIDER
// ============================================================================

interface CountryProviderProps {
  children: ReactNode;
  defaultCountry?: CountryCode;
}

export function CountryProvider({ children, defaultCountry }: CountryProviderProps) {
  const [country, setCountryState] = useState<CountryCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load country from storage on mount
  useEffect(() => {
    const loadCountry = () => {
      try {
        // Check localStorage
        const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
        if (stored && isValidCountryCode(stored)) {
          setCountryState(stored as CountryCode);
        } else {
          // Default to INDIA if no valid country found
          setCountryState('INDIA');
          // Update storage to reflect the default
          localStorage.setItem(COUNTRY_STORAGE_KEY, 'INDIA');
          document.cookie = `selected_country=INDIA; path=/; max-age=${60 * 60 * 24 * 365}`;
        }
      } catch (error) {
        console.error('Error loading country from storage:', error);
        // Fallback to INDIA on error
        setCountryState('INDIA');
      } finally {
        setIsLoading(false);
      }
    };

    loadCountry();
  }, [defaultCountry]);

  // Set country and persist
  const setCountry = useCallback((newCountry: CountryCode) => {
    setCountryState(newCountry);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, newCountry);
      // Also set a cookie for middleware access
      document.cookie = `selected_country=${newCountry}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch (error) {
      console.error('Error saving country to storage:', error);
    }
  }, []);

  // Clear country selection
  const clearCountry = useCallback(() => {
    setCountryState(null);
    try {
      localStorage.removeItem(COUNTRY_STORAGE_KEY);
      document.cookie = 'selected_country=; path=/; max-age=0';
    } catch (error) {
      console.error('Error clearing country from storage:', error);
    }
  }, []);

  // Get country config
  const countryConfig = country ? COUNTRY_CONFIGS[country] : null;

  // Get supported countries list
  const getSupportedCountries = useCallback(() => {
    return Object.values(COUNTRY_CONFIGS).map((config) => ({
      code: config.code,
      name: config.name,
      flag: config.uiConfig.flagEmoji,
      currency: config.currency,
    }));
  }, []);

  const value: CountryContextType = {
    country,
    countryConfig,
    setCountry,
    clearCountry,
    isLoading,
    isCountrySelected: !!country,
    getSupportedCountries,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useCountry hook
 *
 * Access country context from any component
 *
 * @example
 * ```tsx
 * const { country, setCountry, countryConfig } = useCountry();
 *
 * // Check if country is selected
 * if (!country) {
 *   return <CountrySelector />;
 * }
 *
 * // Use country-specific config
 * console.log(countryConfig.currency); // 'INR' or 'AED'
 * ```
 */
export function useCountry(): CountryContextType {
  const context = useContext(CountryContext);

  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }

  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate country code
 */
function isValidCountryCode(code: string): code is CountryCode {
  return code in COUNTRY_CONFIGS;
}

/**
 * Get country from cookie (for server-side)
 */
export function getCountryFromCookie(cookieString?: string): CountryCode | null {
  if (!cookieString) return null;

  const match = cookieString.match(/selected_country=([^;]+)/);
  if (match && isValidCountryCode(match[1])) {
    return match[1] as CountryCode;
  }

  return null;
}

// ============================================================================
// HIGHER-ORDER COMPONENT
// ============================================================================

/**
 * withCountry HOC
 *
 * Wrap a component to require country selection
 */
export function withCountry<P extends object>(
  WrappedComponent: React.ComponentType<P & { country: CountryCode; countryConfig: CountryConfig }>
) {
  return function WithCountryComponent(props: P) {
    const { country, countryConfig, isLoading, isCountrySelected } = useCountry();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isCountrySelected || !country || !countryConfig) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please select a country
          </h2>
          <p className="text-gray-600 mb-4">
            You need to select a country before accessing this feature.
          </p>
          <a
            href="/dashboard/country-select"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Country
          </a>
        </div>
      );
    }

    return <WrappedComponent {...props} country={country} countryConfig={countryConfig} />;
  };
}
