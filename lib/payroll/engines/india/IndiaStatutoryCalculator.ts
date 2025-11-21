// ============================================================================
// INDIA STATUTORY CALCULATOR
// PF, ESIC, Professional Tax, LWF, Gratuity, Bonus
// ============================================================================

import { IndiaPFDetails, IndiaESICDetails, IndiaPTDetails, IndiaGratuityDetails } from '../../core/types';

/**
 * India Statutory Calculator
 *
 * Handles all statutory deductions and contributions for India:
 * - Provident Fund (PF) - EPFO
 * - Employees' State Insurance (ESI)
 * - Professional Tax (PT) - State-wise
 * - Labour Welfare Fund (LWF) - State-wise
 * - Gratuity
 * - Statutory Bonus
 */
export class IndiaStatutoryCalculator {
  // =========================================================================
  // PROVIDENT FUND CONSTANTS
  // =========================================================================

  static readonly PF_WAGE_CEILING = 15000; // Monthly ceiling for PF
  static readonly PF_EMPLOYEE_RATE = 0.12; // 12% employee contribution
  static readonly PF_EMPLOYER_TOTAL_RATE = 0.12; // 12% employer contribution

  // Employer's 12% split
  static readonly EPS_RATE = 0.0833; // 8.33% to EPS (Pension)
  static readonly EPF_EMPLOYER_RATE = 0.0367; // 3.67% to EPF

  // Admin charges
  static readonly PF_ADMIN_CHARGES_RATE = 0.005; // 0.5% admin charges
  static readonly EDLI_CHARGES_RATE = 0.005; // 0.5% EDLI charges (on ₹15000 max)

  // =========================================================================
  // ESIC CONSTANTS
  // =========================================================================

  static readonly ESIC_WAGE_CEILING = 21000; // Monthly ceiling for ESIC
  static readonly ESIC_EMPLOYEE_RATE = 0.0075; // 0.75%
  static readonly ESIC_EMPLOYER_RATE = 0.0325; // 3.25%

  // =========================================================================
  // GRATUITY CONSTANTS
  // =========================================================================

  static readonly GRATUITY_ELIGIBILITY_YEARS = 5;
  static readonly GRATUITY_TAX_EXEMPT_LIMIT = 2000000; // ₹20 lakhs

  // =========================================================================
  // PROVIDENT FUND CALCULATIONS
  // =========================================================================

  /**
   * Calculate PF contributions
   * @param basic - Basic salary
   * @param da - Dearness Allowance (if any)
   * @param isVoluntaryHigherPF - Opt for PF on full basic (above ceiling)
   */
  static calculatePF(
    basic: number,
    da: number = 0,
    isVoluntaryHigherPF: boolean = false
  ): IndiaPFDetails {
    // PF wage = Basic + DA
    const pfWageBase = basic + da;

    // Apply ceiling unless voluntary higher PF opted
    const pfWage = isVoluntaryHigherPF ? pfWageBase : Math.min(pfWageBase, this.PF_WAGE_CEILING);

    // Employee contribution - always 12% of PF wage
    const employeeContribution = Math.round(pfWage * this.PF_EMPLOYEE_RATE);

    // Employer contribution split
    // EPS: 8.33% (only on wage up to ₹15000)
    const epsWage = Math.min(pfWageBase, this.PF_WAGE_CEILING);
    const eps = Math.round(epsWage * this.EPS_RATE);

    // EPF: Remaining of 12% goes to EPF
    const employerContribution = Math.round(pfWage * this.PF_EMPLOYER_TOTAL_RATE);
    const epf = employerContribution - eps;

    // Admin charges (0.5% on total PF wages, minimum ₹500)
    const adminCharges = Math.max(500, Math.round(pfWage * this.PF_ADMIN_CHARGES_RATE));

    // EDLI charges (0.5% on ₹15000 max)
    const edliCharges = Math.round(Math.min(pfWage, this.PF_WAGE_CEILING) * this.EDLI_CHARGES_RATE);

    return {
      pfWage,
      employeeContribution,
      employerContribution,
      eps,
      epf,
      adminCharges,
      edliCharges,
    };
  }

  /**
   * Check if PF is applicable
   * PF is mandatory for establishments with 20+ employees
   * And for employees earning basic + DA ≤ ₹15000 at joining
   */
  static isPFApplicable(
    basicAtJoining: number,
    daAtJoining: number = 0,
    isEstablishmentCovered: boolean = true
  ): boolean {
    if (!isEstablishmentCovered) return false;

    // PF is mandatory if basic + DA ≤ ₹15000 at the time of joining
    // However, most companies cover all employees
    return true; // Typically applicable to all
  }

  // =========================================================================
  // ESIC CALCULATIONS
  // =========================================================================

  /**
   * Calculate ESIC contributions
   * @param grossSalary - Monthly gross salary
   */
  static calculateESIC(grossSalary: number): IndiaESICDetails {
    const isApplicable = grossSalary <= this.ESIC_WAGE_CEILING;

    if (!isApplicable) {
      return {
        grossWage: grossSalary,
        employeeContribution: 0,
        employerContribution: 0,
        isApplicable: false,
      };
    }

    const employeeContribution = Math.round(grossSalary * this.ESIC_EMPLOYEE_RATE);
    const employerContribution = Math.round(grossSalary * this.ESIC_EMPLOYER_RATE);

    return {
      grossWage: grossSalary,
      employeeContribution,
      employerContribution,
      isApplicable: true,
    };
  }

  /**
   * Check if ESIC is applicable
   * ESIC applies to employees earning gross ≤ ₹21000/month
   * In establishments with 10+ employees
   */
  static isESICApplicable(
    grossSalary: number,
    isEstablishmentCovered: boolean = true
  ): boolean {
    return isEstablishmentCovered && grossSalary <= this.ESIC_WAGE_CEILING;
  }

  // =========================================================================
  // PROFESSIONAL TAX CALCULATIONS
  // =========================================================================

  /**
   * Professional Tax slabs by state
   * Most states have monthly deduction with annual ceiling
   */
  private static readonly PT_SLABS: Record<string, Array<{ min: number; max: number; amount: number }>> = {
    MAHARASHTRA: [
      { min: 0, max: 7500, amount: 0 },
      { min: 7501, max: 10000, amount: 175 },
      { min: 10001, max: Infinity, amount: 200 }, // ₹300 for Feb
    ],
    KARNATAKA: [
      { min: 0, max: 15000, amount: 0 },
      { min: 15001, max: Infinity, amount: 200 },
    ],
    WEST_BENGAL: [
      { min: 0, max: 10000, amount: 0 },
      { min: 10001, max: 15000, amount: 110 },
      { min: 15001, max: 25000, amount: 130 },
      { min: 25001, max: 40000, amount: 150 },
      { min: 40001, max: Infinity, amount: 200 },
    ],
    TAMIL_NADU: [
      { min: 0, max: 21000, amount: 0 },
      { min: 21001, max: 30000, amount: 100 },
      { min: 30001, max: 45000, amount: 235 },
      { min: 45001, max: 60000, amount: 510 },
      { min: 60001, max: 75000, amount: 760 },
      { min: 75001, max: Infinity, amount: 1095 },
    ],
    TELANGANA: [
      { min: 0, max: 15000, amount: 0 },
      { min: 15001, max: 20000, amount: 150 },
      { min: 20001, max: Infinity, amount: 200 },
    ],
    ANDHRA_PRADESH: [
      { min: 0, max: 15000, amount: 0 },
      { min: 15001, max: 20000, amount: 150 },
      { min: 20001, max: Infinity, amount: 200 },
    ],
    GUJARAT: [
      { min: 0, max: 5999, amount: 0 },
      { min: 6000, max: 8999, amount: 80 },
      { min: 9000, max: 11999, amount: 150 },
      { min: 12000, max: Infinity, amount: 200 },
    ],
    MADHYA_PRADESH: [
      { min: 0, max: 18750, amount: 0 },
      { min: 18751, max: 25000, amount: 125 },
      { min: 25001, max: Infinity, amount: 208 }, // ₹2500/year
    ],
    KERALA: [
      { min: 0, max: 11999, amount: 0 },
      { min: 12000, max: 17999, amount: 120 },
      { min: 18000, max: 29999, amount: 180 },
      { min: 30000, max: 44999, amount: 300 },
      { min: 45000, max: 59999, amount: 450 },
      { min: 60000, max: 74999, amount: 600 },
      { min: 75000, max: 99999, amount: 750 },
      { min: 100000, max: Infinity, amount: 1000 },
    ],
    ODISHA: [
      { min: 0, max: 15000, amount: 0 },
      { min: 15001, max: Infinity, amount: 200 },
    ],
    ASSAM: [
      { min: 0, max: 10000, amount: 0 },
      { min: 10001, max: 15000, amount: 150 },
      { min: 15001, max: 25000, amount: 180 },
      { min: 25001, max: Infinity, amount: 208 },
    ],
    JHARKHAND: [
      { min: 0, max: 25000, amount: 0 },
      { min: 25001, max: 41666, amount: 100 },
      { min: 41667, max: 66666, amount: 150 },
      { min: 66667, max: 83333, amount: 175 },
      { min: 83334, max: Infinity, amount: 208 },
    ],
    BIHAR: [
      { min: 0, max: 25000, amount: 0 },
      { min: 25001, max: 50000, amount: 100 },
      { min: 50001, max: Infinity, amount: 200 },
    ],
    PUNJAB: [
      { min: 0, max: Infinity, amount: 0 }, // No PT in Punjab
    ],
    HARYANA: [
      { min: 0, max: Infinity, amount: 0 }, // No PT in Haryana
    ],
    RAJASTHAN: [
      { min: 0, max: Infinity, amount: 0 }, // No PT in Rajasthan
    ],
    DELHI: [
      { min: 0, max: Infinity, amount: 0 }, // No PT in Delhi
    ],
    UTTAR_PRADESH: [
      { min: 0, max: Infinity, amount: 0 }, // No PT in UP
    ],
  };

  /**
   * Calculate Professional Tax
   * @param grossSalary - Monthly gross salary
   * @param state - State code
   * @param month - Month (1-12) for special cases like Maharashtra Feb
   */
  static calculatePT(
    grossSalary: number,
    state: string,
    month?: number
  ): IndiaPTDetails {
    const stateNormalized = state.toUpperCase().replace(/\s+/g, '_');
    const slabs = this.PT_SLABS[stateNormalized] || this.PT_SLABS['KARNATAKA']; // Default fallback

    let ptAmount = 0;

    for (const slab of slabs) {
      if (grossSalary >= slab.min && grossSalary <= slab.max) {
        ptAmount = slab.amount;
        break;
      }
    }

    // Maharashtra special case - February has ₹300 for higher slabs
    if (stateNormalized === 'MAHARASHTRA' && month === 2 && grossSalary > 10000) {
      ptAmount = 300;
    }

    return {
      state,
      grossSalary,
      ptAmount,
      frequency: 'monthly',
    };
  }

  /**
   * Get annual PT ceiling
   * Most states have ₹2500 annual ceiling
   */
  static getAnnualPTCeiling(state: string): number {
    const stateNormalized = state.toUpperCase().replace(/\s+/g, '_');

    // States with no PT
    if (['PUNJAB', 'HARYANA', 'RAJASTHAN', 'DELHI', 'UTTAR_PRADESH'].includes(stateNormalized)) {
      return 0;
    }

    return 2500; // Standard ceiling
  }

  // =========================================================================
  // LABOUR WELFARE FUND
  // =========================================================================

  /**
   * LWF contributions by state
   * Typically collected half-yearly or annually
   */
  private static readonly LWF_CONFIG: Record<string, {
    employee: number;
    employer: number;
    frequency: 'monthly' | 'half-yearly' | 'annual';
    applicableMonths?: number[];
  }> = {
    MAHARASHTRA: {
      employee: 25,
      employer: 75,
      frequency: 'half-yearly',
      applicableMonths: [6, 12], // June and December
    },
    KARNATAKA: {
      employee: 20,
      employer: 40,
      frequency: 'annual',
      applicableMonths: [1], // January
    },
    TAMIL_NADU: {
      employee: 5,
      employer: 10,
      frequency: 'half-yearly',
      applicableMonths: [1, 7],
    },
    GUJARAT: {
      employee: 6,
      employer: 12,
      frequency: 'half-yearly',
      applicableMonths: [1, 7],
    },
    WEST_BENGAL: {
      employee: 3,
      employer: 5,
      frequency: 'half-yearly',
      applicableMonths: [1, 7],
    },
    MADHYA_PRADESH: {
      employee: 10,
      employer: 30,
      frequency: 'half-yearly',
      applicableMonths: [1, 7],
    },
    TELANGANA: {
      employee: 2,
      employer: 5,
      frequency: 'annual',
      applicableMonths: [12],
    },
    ANDHRA_PRADESH: {
      employee: 2,
      employer: 5,
      frequency: 'annual',
      applicableMonths: [12],
    },
    KERALA: {
      employee: 20,
      employer: 20,
      frequency: 'half-yearly',
      applicableMonths: [1, 7],
    },
    DELHI: {
      employee: 1,
      employer: 2,
      frequency: 'half-yearly',
      applicableMonths: [6, 12],
    },
    HARYANA: {
      employee: 31,
      employer: 62,
      frequency: 'annual',
      applicableMonths: [1],
    },
    PUNJAB: {
      employee: 5,
      employer: 20,
      frequency: 'half-yearly',
      applicableMonths: [6, 12],
    },
  };

  /**
   * Calculate LWF contribution
   * @param state - State code
   * @param month - Current month to check if applicable
   */
  static calculateLWF(
    state: string,
    month: number
  ): { employee: number; employer: number; isApplicable: boolean } {
    const stateNormalized = state.toUpperCase().replace(/\s+/g, '_');
    const config = this.LWF_CONFIG[stateNormalized];

    if (!config) {
      return { employee: 0, employer: 0, isApplicable: false };
    }

    const isApplicable = config.applicableMonths?.includes(month) ?? false;

    if (!isApplicable) {
      return { employee: 0, employer: 0, isApplicable: false };
    }

    return {
      employee: config.employee,
      employer: config.employer,
      isApplicable: true,
    };
  }

  // =========================================================================
  // GRATUITY CALCULATION
  // =========================================================================

  /**
   * Calculate gratuity as per Payment of Gratuity Act, 1972
   * Formula: (Last drawn salary × 15 × Years of service) / 26
   * @param lastDrawnSalary - Basic + DA
   * @param yearsOfService - Years of continuous service
   */
  static calculateGratuity(
    lastDrawnSalary: number,
    yearsOfService: number
  ): IndiaGratuityDetails {
    // Gratuity payable only after 5 years
    if (yearsOfService < this.GRATUITY_ELIGIBILITY_YEARS) {
      return {
        yearsOfService,
        lastDrawnSalary,
        gratuityAmount: 0,
        isTaxable: false,
        taxExemptLimit: this.GRATUITY_TAX_EXEMPT_LIMIT,
      };
    }

    // Formula: (Last drawn salary × 15 × Years of service) / 26
    const gratuityAmount = Math.round((lastDrawnSalary * 15 * yearsOfService) / 26);

    // Tax exempt up to ₹20 lakhs
    const isTaxable = gratuityAmount > this.GRATUITY_TAX_EXEMPT_LIMIT;

    return {
      yearsOfService,
      lastDrawnSalary,
      gratuityAmount,
      isTaxable,
      taxExemptLimit: this.GRATUITY_TAX_EXEMPT_LIMIT,
    };
  }

  // =========================================================================
  // STATUTORY BONUS
  // =========================================================================

  /**
   * Calculate Statutory Bonus as per Payment of Bonus Act, 1965
   * Minimum: 8.33% of basic + DA (or ₹7000 p.m., whichever is higher)
   * Maximum: 20% of basic + DA
   */
  static calculateBonus(
    basicSalary: number,
    da: number = 0,
    bonusPercentage: number = 8.33
  ): { monthlyBonus: number; annualBonus: number; effectivePercentage: number } {
    const salaryForBonus = basicSalary + da;

    // Ceiling for bonus calculation - ₹7000 or actual, whichever is lower
    const ceilingAmount = 7000;
    const salaryForCalculation = Math.min(salaryForBonus, ceilingAmount);

    // Bonus percentage (between 8.33% and 20%)
    const effectivePercentage = Math.max(8.33, Math.min(20, bonusPercentage));

    const annualBonus = Math.round(salaryForCalculation * 12 * (effectivePercentage / 100));
    const monthlyBonus = Math.round(annualBonus / 12);

    return {
      monthlyBonus,
      annualBonus,
      effectivePercentage,
    };
  }
}
