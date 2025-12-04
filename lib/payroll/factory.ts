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

      default:
        throw new Error(`Payroll engine not available for country: ${countryCode}`);
    }
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
    return ['INDIA'];
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
