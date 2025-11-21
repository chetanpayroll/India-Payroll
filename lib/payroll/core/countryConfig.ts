// ============================================================================
// COUNTRY CONFIGURATION - MULTI-COUNTRY PAYROLL SYSTEM
// ============================================================================

import { CountryCode, Currency } from './types';

/**
 * Country-specific configuration for payroll processing
 */
export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: Currency;
  currencySymbol: string;
  locale: string;

  // Financial Year
  financialYearStart: number; // Month (1-12)
  financialYearFormat: string; // e.g., "2024-25" or "2024"

  // Working Days
  weekendDays: number[]; // 0 = Sunday, 6 = Saturday
  defaultWorkingDaysPerMonth: number;
  defaultWorkingHoursPerDay: number;

  // Statutory Compliance
  statutoryCompliance: string[];
  complianceAuthorities: Record<string, ComplianceAuthority>;

  // Tax Configuration
  taxConfig: TaxConfig;

  // Payroll Configuration
  payrollConfig: PayrollConfig;

  // UI Configuration
  uiConfig: UIConfig;

  // Validation Patterns
  validationPatterns: Record<string, RegExp>;

  // Feature Flags
  features: FeatureFlags;
}

export interface ComplianceAuthority {
  name: string;
  code: string;
  website?: string;
  filingFrequency: 'monthly' | 'quarterly' | 'annual';
  dueDate?: number; // Day of month
}

export interface TaxConfig {
  hasTax: boolean;
  taxName: string;
  taxType: 'flat' | 'slab' | 'none';
  hasMultipleRegimes?: boolean;
  regimes?: string[];
  standardDeduction?: number;
  maxSurchargeRate?: number;
  cessRate?: number;
}

export interface PayrollConfig {
  maxOvertimeMultiplier: number;
  absenceDeductionBasis: 'calendar' | 'working';
  gratuityEligibilityYears: number;
  gratuityCalculationMethod: string;
  leaveCashoutAllowed: boolean;
}

export interface UIConfig {
  flagEmoji: string;
  flagUrl?: string;
  colorTheme: string;
  dateFormat: string;
  numberFormat: {
    thousandSeparator: string;
    decimalSeparator: string;
    decimals: number;
  };
}

export interface FeatureFlags {
  hasProvidentFund: boolean;
  hasSocialSecurity: boolean;
  hasProfessionalTax: boolean;
  hasLaborWelfareFund: boolean;
  hasIncomeTax: boolean;
  hasGratuity: boolean;
  hasHealthInsurance: boolean;
  hasWageProtectionSystem: boolean;
  hasPension: boolean;
}

// ============================================================================
// COUNTRY CONFIGURATIONS
// ============================================================================

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  // -------------------------------------------------------------------------
  // UAE CONFIGURATION
  // -------------------------------------------------------------------------
  UAE: {
    code: 'UAE',
    name: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'AED',
    locale: 'en-AE',

    financialYearStart: 1, // January
    financialYearFormat: 'YYYY',

    weekendDays: [5, 6], // Friday, Saturday
    defaultWorkingDaysPerMonth: 22,
    defaultWorkingHoursPerDay: 8,

    statutoryCompliance: ['WPS', 'GPSSA', 'MOHRE'],
    complianceAuthorities: {
      WPS: {
        name: 'Wage Protection System',
        code: 'WPS',
        website: 'https://www.mohre.gov.ae',
        filingFrequency: 'monthly',
        dueDate: 15,
      },
      GPSSA: {
        name: 'General Pension & Social Security Authority',
        code: 'GPSSA',
        website: 'https://www.gpssa.gov.ae',
        filingFrequency: 'monthly',
        dueDate: 15,
      },
      MOHRE: {
        name: 'Ministry of Human Resources and Emiratisation',
        code: 'MOHRE',
        filingFrequency: 'annual',
      },
    },

    taxConfig: {
      hasTax: false,
      taxName: 'N/A',
      taxType: 'none',
    },

    payrollConfig: {
      maxOvertimeMultiplier: 1.5,
      absenceDeductionBasis: 'calendar',
      gratuityEligibilityYears: 1,
      gratuityCalculationMethod: 'UAE_LABOR_LAW',
      leaveCashoutAllowed: true,
    },

    uiConfig: {
      flagEmoji: '🇦🇪',
      colorTheme: 'emerald',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: {
        thousandSeparator: ',',
        decimalSeparator: '.',
        decimals: 2,
      },
    },

    validationPatterns: {
      emiratesId: /^784-\d{4}-\d{7}-\d$/,
      iban: /^AE\d{2}\d{3}\d{16}$/,
      laborCard: /^\d{9,12}$/,
    },

    features: {
      hasProvidentFund: false,
      hasSocialSecurity: true, // GPSSA for Emiratis
      hasProfessionalTax: false,
      hasLaborWelfareFund: false,
      hasIncomeTax: false,
      hasGratuity: true,
      hasHealthInsurance: true,
      hasWageProtectionSystem: true,
      hasPension: true, // For Emiratis
    },
  },

  // -------------------------------------------------------------------------
  // INDIA CONFIGURATION
  // -------------------------------------------------------------------------
  INDIA: {
    code: 'INDIA',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',

    financialYearStart: 4, // April
    financialYearFormat: 'YYYY-YY', // e.g., "2024-25"

    weekendDays: [0, 6], // Sunday, Saturday (mostly 5-day week)
    defaultWorkingDaysPerMonth: 26,
    defaultWorkingHoursPerDay: 8,

    statutoryCompliance: ['PF', 'ESIC', 'PT', 'TDS', 'LWF', 'GRATUITY', 'BONUS'],
    complianceAuthorities: {
      PF: {
        name: 'Employees Provident Fund Organisation',
        code: 'EPFO',
        website: 'https://www.epfindia.gov.in',
        filingFrequency: 'monthly',
        dueDate: 15,
      },
      ESIC: {
        name: 'Employees State Insurance Corporation',
        code: 'ESIC',
        website: 'https://www.esic.gov.in',
        filingFrequency: 'monthly',
        dueDate: 15,
      },
      TDS: {
        name: 'Income Tax Department - TDS',
        code: 'TDS',
        website: 'https://www.incometax.gov.in',
        filingFrequency: 'quarterly',
        dueDate: 7,
      },
      PT: {
        name: 'Professional Tax',
        code: 'PT',
        filingFrequency: 'monthly',
      },
      LWF: {
        name: 'Labour Welfare Fund',
        code: 'LWF',
        filingFrequency: 'annual',
      },
    },

    taxConfig: {
      hasTax: true,
      taxName: 'Income Tax (TDS)',
      taxType: 'slab',
      hasMultipleRegimes: true,
      regimes: ['OLD', 'NEW'],
      standardDeduction: 50000, // FY 2024-25
      maxSurchargeRate: 0.37, // 37%
      cessRate: 0.04, // 4%
    },

    payrollConfig: {
      maxOvertimeMultiplier: 2.0,
      absenceDeductionBasis: 'calendar',
      gratuityEligibilityYears: 5,
      gratuityCalculationMethod: 'PAYMENT_OF_GRATUITY_ACT',
      leaveCashoutAllowed: true,
    },

    uiConfig: {
      flagEmoji: '🇮🇳',
      colorTheme: 'orange',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: {
        thousandSeparator: ',',
        decimalSeparator: '.',
        decimals: 2,
      },
    },

    validationPatterns: {
      pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
      aadhaar: /^\d{12}$/,
      uan: /^\d{12}$/,
      esicNumber: /^\d{17}$/,
      ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      gstin: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      tan: /^[A-Z]{4}\d{5}[A-Z]$/,
    },

    features: {
      hasProvidentFund: true,
      hasSocialSecurity: true, // ESIC
      hasProfessionalTax: true,
      hasLaborWelfareFund: true,
      hasIncomeTax: true,
      hasGratuity: true,
      hasHealthInsurance: false, // Through ESIC
      hasWageProtectionSystem: false,
      hasPension: true, // EPS
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get configuration for a specific country
 */
export function getCountryConfig(countryCode: CountryCode): CountryConfig {
  const config = COUNTRY_CONFIGS[countryCode];
  if (!config) {
    throw new Error(`Country configuration not found for: ${countryCode}`);
  }
  return config;
}

/**
 * Get all supported countries
 */
export function getSupportedCountries(): CountryCode[] {
  return Object.keys(COUNTRY_CONFIGS) as CountryCode[];
}

/**
 * Check if a country is supported
 */
export function isCountrySupported(countryCode: string): countryCode is CountryCode {
  return countryCode in COUNTRY_CONFIGS;
}

/**
 * Get financial year string for a given date and country
 */
export function getFinancialYearForCountry(date: Date, countryCode: CountryCode): string {
  const config = getCountryConfig(countryCode);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  if (config.financialYearStart === 1) {
    // Calendar year (e.g., UAE)
    return year.toString();
  }

  // Financial year starting in different month (e.g., India - April)
  if (month >= config.financialYearStart) {
    // We're in the first part of FY
    const startYear = year;
    const endYear = (year + 1) % 100;
    return `${startYear}-${endYear.toString().padStart(2, '0')}`;
  } else {
    // We're in the second part of FY
    const startYear = year - 1;
    const endYear = year % 100;
    return `${startYear}-${endYear.toString().padStart(2, '0')}`;
  }
}

/**
 * Get country-specific validation pattern
 */
export function getValidationPattern(countryCode: CountryCode, patternName: string): RegExp | undefined {
  const config = getCountryConfig(countryCode);
  return config.validationPatterns[patternName];
}

/**
 * Format currency for a specific country
 */
export function formatCurrencyForCountry(amount: number, countryCode: CountryCode): string {
  const config = getCountryConfig(countryCode);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.uiConfig.numberFormat.decimals,
    maximumFractionDigits: config.uiConfig.numberFormat.decimals,
  }).format(amount);
}
