// ============================================================================
// PAYROLL ENGINE FACTORY - FACTORY PATTERN
// ============================================================================

import { IPayrollEngine } from './core/IPayrollEngine';
import { CountryCode } from './core/types';
import { IndiaPayrollEngine } from './engines/india/IndiaPayrollEngine';
// Import UAE engine wrapper when available
// import { UAEPayrollEngine } from './engines/uae/UAEPayrollEngine';

/**
 * PayrollEngineFactory
 *
 * Factory class for creating country-specific payroll engines.
 * Implements the Factory Pattern to encapsulate engine creation logic.
 *
 * @example
 * ```typescript
 * // Get India payroll engine
 * const indiaEngine = PayrollEngineFactory.getEngine('INDIA');
 *
 * // Process payroll
 * const payrollData = await indiaEngine.processPayroll(employee, period);
 * ```
 */
export class PayrollEngineFactory {
  private static engines: Map<CountryCode, IPayrollEngine> = new Map();

  /**
   * Get payroll engine for a specific country
   * Uses singleton pattern - creates engine once and reuses
   *
   * @param countryCode - Country code (UAE, INDIA, etc.)
   * @returns Country-specific payroll engine
   * @throws Error if country is not supported
   */
  static getEngine(countryCode: CountryCode): IPayrollEngine {
    // Check cache first
    let engine = this.engines.get(countryCode);

    if (!engine) {
      // Create new engine based on country
      engine = this.createEngine(countryCode);
      this.engines.set(countryCode, engine);
    }

    return engine;
  }

  /**
   * Create a new engine instance
   * Private method - called by getEngine when needed
   */
  private static createEngine(countryCode: CountryCode): IPayrollEngine {
    switch (countryCode) {
      case 'INDIA':
        return new IndiaPayrollEngine();

      case 'UAE':
        // For now, return a placeholder or wrapper for existing UAE logic
        // This can be updated to use UAEPayrollEngine when implemented
        return this.createUAEEngineWrapper();

      default:
        throw new Error(`Payroll engine not available for country: ${countryCode}`);
    }
  }

  /**
   * Create a wrapper for existing UAE payroll logic
   * This maintains backward compatibility with existing code
   */
  private static createUAEEngineWrapper(): IPayrollEngine {
    // Temporary wrapper that delegates to existing UAE logic
    // This will be replaced with full UAEPayrollEngine implementation
    return {
      countryCode: 'UAE',
      version: '1.0.0',

      validateEmployee: () => ({ isValid: true, errors: [] }),
      validateSalaryStructure: () => ({ isValid: true, errors: [] }),
      validatePayrollPeriod: () => ({ isValid: true, errors: [] }),

      calculateGrossSalary: (components) => {
        return components.basic +
          Object.values(components.allowances).reduce((a, b) => a + b, 0) +
          Object.values(components.earnings).reduce((a, b) => a + b, 0);
      },

      calculateDeductions: () => ({
        statutory: {},
        voluntary: {},
        total: 0,
      }),

      calculateNetSalary: (gross, deductions) => gross - deductions.total,

      calculateEmployerContributions: () => ({}),

      processPayroll: async () => {
        throw new Error('Use existing UAE payroll processing');
      },

      processBulkPayroll: async () => {
        throw new Error('Use existing UAE payroll processing');
      },

      generatePayslip: () => {
        throw new Error('Use existing UAE payslip generation');
      },

      generateComplianceReports: () => [],

      getWorkingDays: () => 22,

      getFinancialYear: (date) => date.getFullYear().toString(),

      formatCurrency: (amount) => `AED ${amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`,

      amountToWords: (amount) => {
        // Basic implementation
        return `AED ${amount}`;
      },
    };
  }

  /**
   * Check if engine exists for a country
   */
  static hasEngine(countryCode: CountryCode): boolean {
    try {
      this.getEngine(countryCode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all supported countries
   */
  static getSupportedCountries(): CountryCode[] {
    return ['UAE', 'INDIA'];
  }

  /**
   * Clear engine cache (useful for testing)
   */
  static clearCache(): void {
    this.engines.clear();
  }
}

/**
 * Convenience function to get payroll engine
 * Can be used as an alternative to factory method
 */
export function getPayrollEngine(countryCode: CountryCode): IPayrollEngine {
  return PayrollEngineFactory.getEngine(countryCode);
}

/**
 * Type guard to check if a country code is valid
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return PayrollEngineFactory.getSupportedCountries().includes(code as CountryCode);
}
