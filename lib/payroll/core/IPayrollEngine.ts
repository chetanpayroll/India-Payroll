// ============================================================================
// PAYROLL ENGINE INTERFACE - STRATEGY PATTERN
// ============================================================================

import {
  CountryCode,
  ValidationResult,
  SalaryComponents,
  Deductions,
  PayrollData,
  PayrollPeriod,
  Payslip,
  Report,
  BaseEmployee,
} from './types';

/**
 * IPayrollEngine Interface
 *
 * This is the core interface that all country-specific payroll engines must implement.
 * Uses Strategy Pattern to allow different implementations for different countries.
 *
 * @example
 * ```typescript
 * const engine = PayrollEngineFactory.getEngine('INDIA');
 * const result = await engine.processPayroll(employee, period);
 * ```
 */
export interface IPayrollEngine {
  /**
   * Country code this engine handles
   */
  readonly countryCode: CountryCode;

  /**
   * Engine version for compatibility tracking
   */
  readonly version: string;

  // =========================================================================
  // VALIDATION METHODS
  // =========================================================================

  /**
   * Validate employee data for payroll processing
   * @param employee - Employee data to validate
   * @returns Validation result with errors and warnings
   */
  validateEmployee(employee: any): ValidationResult;

  /**
   * Validate salary structure
   * @param salaryComponents - Salary breakdown to validate
   * @returns Validation result
   */
  validateSalaryStructure(salaryComponents: SalaryComponents): ValidationResult;

  /**
   * Validate payroll period
   * @param period - Pay period to validate
   * @returns Validation result
   */
  validatePayrollPeriod(period: PayrollPeriod): ValidationResult;

  // =========================================================================
  // CALCULATION METHODS
  // =========================================================================

  /**
   * Calculate gross salary from components
   * @param components - All salary components (basic, allowances, etc.)
   * @param period - Pay period for pro-ration if needed
   * @returns Gross salary amount
   */
  calculateGrossSalary(components: SalaryComponents, period?: PayrollPeriod): number;

  /**
   * Calculate all deductions (statutory + voluntary)
   * @param grossSalary - Gross salary amount
   * @param employee - Employee data for eligibility checks
   * @param period - Pay period
   * @returns Deduction breakdown
   */
  calculateDeductions(grossSalary: number, employee: any, period?: PayrollPeriod): Deductions;

  /**
   * Calculate net salary
   * @param grossSalary - Gross salary amount
   * @param deductions - Total deductions
   * @returns Net salary amount
   */
  calculateNetSalary(grossSalary: number, deductions: Deductions): number;

  /**
   * Calculate employer contributions (PF, ESIC, etc.)
   * @param employee - Employee data
   * @param grossSalary - Gross salary
   * @returns Employer contribution breakdown
   */
  calculateEmployerContributions(employee: any, grossSalary: number): Record<string, number>;

  // =========================================================================
  // PAYROLL PROCESSING
  // =========================================================================

  /**
   * Process complete payroll for an employee
   * @param employee - Employee data
   * @param period - Pay period
   * @param options - Additional processing options
   * @returns Complete payroll data
   */
  processPayroll(
    employee: any,
    period: PayrollPeriod,
    options?: PayrollProcessingOptions
  ): Promise<PayrollData>;

  /**
   * Process payroll for multiple employees
   * @param employees - Array of employees
   * @param period - Pay period
   * @param options - Processing options
   * @returns Array of payroll data
   */
  processBulkPayroll(
    employees: any[],
    period: PayrollPeriod,
    options?: PayrollProcessingOptions
  ): Promise<PayrollData[]>;

  // =========================================================================
  // DOCUMENT GENERATION
  // =========================================================================

  /**
   * Generate payslip for an employee
   * @param data - Payroll data
   * @returns Generated payslip
   */
  generatePayslip(data: PayrollData): Payslip;

  /**
   * Generate compliance reports for a period
   * @param period - Pay period
   * @param employees - Employee data for the period
   * @param payrollData - Processed payroll data
   * @returns Array of compliance reports
   */
  generateComplianceReports(
    period: PayrollPeriod,
    employees: any[],
    payrollData: PayrollData[]
  ): Report[];

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  /**
   * Get working days in a month based on country's calendar
   * @param month - Month (1-12)
   * @param year - Year
   * @returns Number of working days
   */
  getWorkingDays(month: number, year: number): number;

  /**
   * Get financial year for a given date
   * @param date - Date to check
   * @returns Financial year string (e.g., "2024-25" for India)
   */
  getFinancialYear(date: Date): string;

  /**
   * Format currency for display
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  formatCurrency(amount: number): string;

  /**
   * Convert number to words
   * @param amount - Amount to convert
   * @returns Amount in words
   */
  amountToWords(amount: number): string;
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface PayrollProcessingOptions {
  /**
   * Days present in the period (for pro-ration)
   */
  presentDays?: number;

  /**
   * Absence days
   */
  absentDays?: number;

  /**
   * Overtime hours
   */
  overtimeHours?: number;

  /**
   * One-time bonus
   */
  bonus?: number;

  /**
   * Loan deductions
   */
  loanDeductions?: Array<{
    loanId: string;
    amount: number;
  }>;

  /**
   * Salary advances to deduct
   */
  advanceDeductions?: number;

  /**
   * Additional earnings
   */
  additionalEarnings?: Array<{
    code: string;
    name: string;
    amount: number;
  }>;

  /**
   * Additional deductions
   */
  additionalDeductions?: Array<{
    code: string;
    name: string;
    amount: number;
  }>;

  /**
   * Include YTD calculations
   */
  includeYTD?: boolean;

  /**
   * Include tax projections
   */
  includeTaxProjections?: boolean;

  /**
   * Run validation before processing
   */
  validateBeforeProcessing?: boolean;
}

// ============================================================================
// ABSTRACT BASE CLASS
// ============================================================================

/**
 * Abstract base class providing common functionality for all payroll engines.
 * Country-specific engines should extend this class.
 */
export abstract class BasePayrollEngine implements IPayrollEngine {
  abstract readonly countryCode: CountryCode;
  abstract readonly version: string;

  // Abstract methods that must be implemented by country engines
  abstract validateEmployee(employee: any): ValidationResult;
  abstract validateSalaryStructure(salaryComponents: SalaryComponents): ValidationResult;
  abstract validatePayrollPeriod(period: PayrollPeriod): ValidationResult;
  abstract calculateGrossSalary(components: SalaryComponents, period?: PayrollPeriod): number;
  abstract calculateDeductions(grossSalary: number, employee: any, period?: PayrollPeriod): Deductions;
  abstract calculateEmployerContributions(employee: any, grossSalary: number): Record<string, number>;
  abstract generatePayslip(data: PayrollData): Payslip;
  abstract generateComplianceReports(period: PayrollPeriod, employees: any[], payrollData: PayrollData[]): Report[];
  abstract getWorkingDays(month: number, year: number): number;
  abstract getFinancialYear(date: Date): string;
  abstract formatCurrency(amount: number): string;
  abstract amountToWords(amount: number): string;

  /**
   * Calculate net salary (common implementation)
   */
  calculateNetSalary(grossSalary: number, deductions: Deductions): number {
    return Math.round((grossSalary - deductions.total) * 100) / 100;
  }

  /**
   * Process payroll for single employee
   */
  async processPayroll(
    employee: any,
    period: PayrollPeriod,
    options?: PayrollProcessingOptions
  ): Promise<PayrollData> {
    // Validate if requested
    if (options?.validateBeforeProcessing !== false) {
      const validation = this.validateEmployee(employee);
      if (!validation.isValid) {
        throw new Error(`Employee validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }

    // Build salary components from employee
    const components = this.buildSalaryComponents(employee, options);

    // Calculate gross
    const grossSalary = this.calculateGrossSalary(components, period);

    // Calculate deductions
    const deductions = this.calculateDeductions(grossSalary, employee, period);

    // Calculate net
    const netSalary = this.calculateNetSalary(grossSalary, deductions);

    // Calculate employer contributions
    const employerContributions = this.calculateEmployerContributions(employee, grossSalary);

    // Build payroll data
    return this.buildPayrollData(
      employee,
      period,
      components,
      grossSalary,
      deductions,
      netSalary,
      employerContributions,
      options
    );
  }

  /**
   * Process bulk payroll
   */
  async processBulkPayroll(
    employees: any[],
    period: PayrollPeriod,
    options?: PayrollProcessingOptions
  ): Promise<PayrollData[]> {
    const results: PayrollData[] = [];

    for (const employee of employees) {
      try {
        const payrollData = await this.processPayroll(employee, period, options);
        results.push(payrollData);
      } catch (error) {
        console.error(`Failed to process payroll for employee ${employee.id}:`, error);
        // Could add to errors array instead of throwing
      }
    }

    return results;
  }

  /**
   * Build salary components from employee data
   * Override in country-specific engines for custom logic
   */
  protected abstract buildSalaryComponents(
    employee: any,
    options?: PayrollProcessingOptions
  ): SalaryComponents;

  /**
   * Build final payroll data structure
   */
  protected abstract buildPayrollData(
    employee: any,
    period: PayrollPeriod,
    components: SalaryComponents,
    grossSalary: number,
    deductions: Deductions,
    netSalary: number,
    employerContributions: Record<string, number>,
    options?: PayrollProcessingOptions
  ): PayrollData;
}
