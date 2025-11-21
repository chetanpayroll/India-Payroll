// ============================================================================
// INDIA VALIDATOR - COMPREHENSIVE VALIDATION
// ============================================================================

import { ValidationResult, ValidationError, IndiaEmployee, IndiaSalaryStructure } from '../../core/types';
import { getValidationPattern } from '../../core/countryConfig';

/**
 * India Validator
 *
 * Comprehensive validation for Indian payroll data including:
 * - PAN (Permanent Account Number)
 * - Aadhaar (12-digit unique ID)
 * - UAN (Universal Account Number for PF)
 * - ESIC Number
 * - IFSC Code
 * - Bank Account
 * - Salary Structure
 */
export class IndiaValidator {
  // =========================================================================
  // MAIN VALIDATION METHODS
  // =========================================================================

  /**
   * Validate complete employee data
   */
  static validateEmployee(employee: Partial<IndiaEmployee>): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!employee.firstName) {
      errors.push({ field: 'firstName', code: 'REQUIRED', message: 'First name is required' });
    }

    if (!employee.lastName) {
      errors.push({ field: 'lastName', code: 'REQUIRED', message: 'Last name is required' });
    }

    if (!employee.employeeCode) {
      errors.push({ field: 'employeeCode', code: 'REQUIRED', message: 'Employee code is required' });
    }

    // PAN validation
    if (employee.pan) {
      const panResult = this.validatePAN(employee.pan);
      if (!panResult.isValid) {
        errors.push(...panResult.errors);
      }
    } else {
      errors.push({ field: 'pan', code: 'REQUIRED', message: 'PAN is required for Indian employees' });
    }

    // Aadhaar validation (optional but validated if provided)
    if (employee.aadhaar) {
      const aadhaarResult = this.validateAadhaar(employee.aadhaar);
      if (!aadhaarResult.isValid) {
        errors.push(...aadhaarResult.errors);
      }
    }

    // UAN validation (if PF applicable)
    if (employee.pfApplicable && employee.uan) {
      const uanResult = this.validateUAN(employee.uan);
      if (!uanResult.isValid) {
        errors.push(...uanResult.errors);
      }
    }

    // ESIC validation (if ESIC applicable)
    if (employee.esicApplicable && employee.esicNumber) {
      const esicResult = this.validateESICNumber(employee.esicNumber);
      if (!esicResult.isValid) {
        errors.push(...esicResult.errors);
      }
    }

    // Bank details validation
    if (employee.bankAccount) {
      const bankResult = this.validateBankAccount(employee.bankAccount);
      if (!bankResult.isValid) {
        errors.push(...bankResult.errors);
      }
    } else {
      errors.push({ field: 'bankAccount', code: 'REQUIRED', message: 'Bank account number is required' });
    }

    if (employee.ifscCode) {
      const ifscResult = this.validateIFSC(employee.ifscCode);
      if (!ifscResult.isValid) {
        errors.push(...ifscResult.errors);
      }
    } else {
      errors.push({ field: 'ifscCode', code: 'REQUIRED', message: 'IFSC code is required' });
    }

    // Salary structure validation
    if (employee.salaryStructure) {
      const salaryResult = this.validateSalaryStructure(employee.salaryStructure);
      if (!salaryResult.isValid) {
        errors.push(...salaryResult.errors);
      }
    } else {
      errors.push({ field: 'salaryStructure', code: 'REQUIRED', message: 'Salary structure is required' });
    }

    // State validation (required for PT)
    if (!employee.state) {
      errors.push({ field: 'state', code: 'REQUIRED', message: 'State is required for tax calculations' });
    }

    // Tax regime validation
    if (employee.taxRegime && !['OLD', 'NEW'].includes(employee.taxRegime)) {
      errors.push({
        field: 'taxRegime',
        code: 'INVALID_VALUE',
        message: 'Tax regime must be either OLD or NEW',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // =========================================================================
  // DOCUMENT VALIDATION
  // =========================================================================

  /**
   * Validate PAN (Permanent Account Number)
   * Format: ABCDE1234F
   * - First 3 characters: Alphabetic series (AAA-ZZZ)
   * - 4th character: Status of holder (P = Individual, C = Company, etc.)
   * - 5th character: First character of surname/name
   * - Next 4 characters: Sequential digits (0001-9999)
   * - Last character: Alphabetic check digit
   */
  static validatePAN(pan: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!pan) {
      errors.push({ field: 'pan', code: 'REQUIRED', message: 'PAN is required' });
      return { isValid: false, errors };
    }

    const panUpperCase = pan.toUpperCase().trim();

    // Length check
    if (panUpperCase.length !== 10) {
      errors.push({
        field: 'pan',
        code: 'INVALID_LENGTH',
        message: 'PAN must be exactly 10 characters',
      });
      return { isValid: false, errors };
    }

    // Format check
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panPattern.test(panUpperCase)) {
      errors.push({
        field: 'pan',
        code: 'INVALID_FORMAT',
        message: 'PAN format is invalid. Expected format: ABCDE1234F',
      });
      return { isValid: false, errors };
    }

    // 4th character validation (entity type)
    const entityTypes = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'J', 'P', 'T', 'K'];
    const fourthChar = panUpperCase[3];
    if (!entityTypes.includes(fourthChar)) {
      errors.push({
        field: 'pan',
        code: 'INVALID_ENTITY_TYPE',
        message: `Invalid entity type in PAN. Position 4 must be one of: ${entityTypes.join(', ')}`,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Aadhaar number
   * Format: 12 digits
   * - Cannot start with 0 or 1
   * - Has Verhoeff checksum validation
   */
  static validateAadhaar(aadhaar: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!aadhaar) {
      errors.push({ field: 'aadhaar', code: 'REQUIRED', message: 'Aadhaar is required' });
      return { isValid: false, errors };
    }

    // Remove spaces and hyphens
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');

    // Length check
    if (cleanAadhaar.length !== 12) {
      errors.push({
        field: 'aadhaar',
        code: 'INVALID_LENGTH',
        message: 'Aadhaar must be exactly 12 digits',
      });
      return { isValid: false, errors };
    }

    // Only digits
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      errors.push({
        field: 'aadhaar',
        code: 'INVALID_FORMAT',
        message: 'Aadhaar must contain only digits',
      });
      return { isValid: false, errors };
    }

    // Cannot start with 0 or 1
    if (['0', '1'].includes(cleanAadhaar[0])) {
      errors.push({
        field: 'aadhaar',
        code: 'INVALID_START',
        message: 'Aadhaar cannot start with 0 or 1',
      });
    }

    // Verhoeff checksum (simplified - full implementation would be more complex)
    if (!this.verhoeffCheck(cleanAadhaar)) {
      errors.push({
        field: 'aadhaar',
        code: 'INVALID_CHECKSUM',
        message: 'Aadhaar checksum validation failed',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate UAN (Universal Account Number)
   * Format: 12 digits
   */
  static validateUAN(uan: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!uan) {
      return { isValid: true, errors: [] }; // UAN is optional
    }

    const cleanUAN = uan.replace(/[\s-]/g, '');

    if (cleanUAN.length !== 12) {
      errors.push({
        field: 'uan',
        code: 'INVALID_LENGTH',
        message: 'UAN must be exactly 12 digits',
      });
    }

    if (!/^\d{12}$/.test(cleanUAN)) {
      errors.push({
        field: 'uan',
        code: 'INVALID_FORMAT',
        message: 'UAN must contain only digits',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate ESIC Number
   * Format: 17 digits
   */
  static validateESICNumber(esicNumber: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!esicNumber) {
      return { isValid: true, errors: [] }; // ESIC is optional
    }

    const cleanNumber = esicNumber.replace(/[\s-]/g, '');

    if (cleanNumber.length !== 17) {
      errors.push({
        field: 'esicNumber',
        code: 'INVALID_LENGTH',
        message: 'ESIC number must be exactly 17 digits',
      });
    }

    if (!/^\d{17}$/.test(cleanNumber)) {
      errors.push({
        field: 'esicNumber',
        code: 'INVALID_FORMAT',
        message: 'ESIC number must contain only digits',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // =========================================================================
  // BANK VALIDATION
  // =========================================================================

  /**
   * Validate IFSC Code
   * Format: AAAA0XXXXXX
   * - First 4 characters: Bank code (alphabetic)
   * - 5th character: Always 0 (reserved for future use)
   * - Last 6 characters: Branch code (alphanumeric)
   */
  static validateIFSC(ifsc: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!ifsc) {
      errors.push({ field: 'ifscCode', code: 'REQUIRED', message: 'IFSC code is required' });
      return { isValid: false, errors };
    }

    const ifscUpperCase = ifsc.toUpperCase().trim();

    if (ifscUpperCase.length !== 11) {
      errors.push({
        field: 'ifscCode',
        code: 'INVALID_LENGTH',
        message: 'IFSC code must be exactly 11 characters',
      });
      return { isValid: false, errors };
    }

    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifscUpperCase)) {
      errors.push({
        field: 'ifscCode',
        code: 'INVALID_FORMAT',
        message: 'IFSC code format is invalid. Expected format: AAAA0XXXXXX',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Bank Account Number
   * Format: 9-18 digits (varies by bank)
   */
  static validateBankAccount(accountNumber: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!accountNumber) {
      errors.push({ field: 'bankAccount', code: 'REQUIRED', message: 'Bank account number is required' });
      return { isValid: false, errors };
    }

    const cleanNumber = accountNumber.replace(/[\s-]/g, '');

    if (cleanNumber.length < 9 || cleanNumber.length > 18) {
      errors.push({
        field: 'bankAccount',
        code: 'INVALID_LENGTH',
        message: 'Bank account number must be between 9 and 18 digits',
      });
    }

    if (!/^\d+$/.test(cleanNumber)) {
      errors.push({
        field: 'bankAccount',
        code: 'INVALID_FORMAT',
        message: 'Bank account number must contain only digits',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // =========================================================================
  // SALARY VALIDATION
  // =========================================================================

  /**
   * Validate Salary Structure
   */
  static validateSalaryStructure(salary: Partial<IndiaSalaryStructure>): ValidationResult {
    const errors: ValidationError[] = [];

    // Basic salary is required and must be positive
    if (!salary.basic || salary.basic <= 0) {
      errors.push({
        field: 'salaryStructure.basic',
        code: 'INVALID_VALUE',
        message: 'Basic salary must be greater than 0',
      });
    }

    // HRA validation
    if (salary.hra !== undefined) {
      if (salary.hra < 0) {
        errors.push({
          field: 'salaryStructure.hra',
          code: 'INVALID_VALUE',
          message: 'HRA cannot be negative',
        });
      }

      // HRA typically shouldn't exceed basic salary
      if (salary.basic && salary.hra > salary.basic) {
        errors.push({
          field: 'salaryStructure.hra',
          code: 'EXCESSIVE_VALUE',
          message: 'HRA should not exceed basic salary',
        });
      }
    }

    // Special allowance validation
    if (salary.specialAllowance !== undefined && salary.specialAllowance < 0) {
      errors.push({
        field: 'salaryStructure.specialAllowance',
        code: 'INVALID_VALUE',
        message: 'Special allowance cannot be negative',
      });
    }

    // CTC validation (if provided)
    if (salary.ctc !== undefined && salary.basic) {
      if (salary.ctc < salary.basic) {
        errors.push({
          field: 'salaryStructure.ctc',
          code: 'INVALID_VALUE',
          message: 'CTC cannot be less than basic salary',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate statutory applicability based on salary
   */
  static validateStatutoryApplicability(employee: Partial<IndiaEmployee>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: { field: string; code: string; message: string }[] = [];

    if (!employee.salaryStructure?.basic) {
      return { isValid: true, errors, warnings };
    }

    const grossSalary = this.calculateApproxGross(employee.salaryStructure);

    // ESIC applicability check
    if (employee.esicApplicable && grossSalary > 21000) {
      warnings.push({
        field: 'esicApplicable',
        code: 'ESIC_NOT_APPLICABLE',
        message: 'ESIC is not applicable for gross salary above ₹21,000. Please verify.',
      });
    }

    // PF wage ceiling warning
    if (employee.salaryStructure.basic > 15000) {
      warnings.push({
        field: 'pfApplicable',
        code: 'PF_ABOVE_CEILING',
        message: 'Basic salary exceeds PF wage ceiling of ₹15,000. PF will be calculated on ceiling unless opted for higher PF.',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  /**
   * Verhoeff checksum algorithm for Aadhaar validation
   */
  private static verhoeffCheck(num: string): boolean {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];

    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];

    let c = 0;
    const myArray = num.split('').reverse();

    for (let i = 0; i < myArray.length; i++) {
      c = d[c][p[i % 8][parseInt(myArray[i], 10)]];
    }

    return c === 0;
  }

  /**
   * Calculate approximate gross from salary structure
   */
  private static calculateApproxGross(salary: Partial<IndiaSalaryStructure>): number {
    return (
      (salary.basic || 0) +
      (salary.hra || 0) +
      (salary.lta || 0) +
      (salary.specialAllowance || 0) +
      (salary.conveyance || 0) +
      (salary.medicalAllowance || 0)
    );
  }

  /**
   * Format PAN for display
   */
  static formatPAN(pan: string): string {
    return pan.toUpperCase().trim();
  }

  /**
   * Format Aadhaar for display (masked)
   */
  static formatAadhaar(aadhaar: string, masked: boolean = true): string {
    const clean = aadhaar.replace(/[\s-]/g, '');
    if (masked) {
      return `XXXX XXXX ${clean.slice(-4)}`;
    }
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
  }

  /**
   * Format IFSC for display
   */
  static formatIFSC(ifsc: string): string {
    return ifsc.toUpperCase().trim();
  }
}
