// ============================================================================
// INDIA TAX CALCULATOR - FY 2024-25
// ============================================================================

import { IndiaTDSDetails, IndiaTaxDeclarations, IndiaSalaryStructure } from '../../core/types';

/**
 * India Tax Calculator
 *
 * Implements comprehensive income tax calculation for India including:
 * - Old Tax Regime (with exemptions and deductions)
 * - New Tax Regime (lower rates, fewer exemptions)
 * - Standard Deduction
 * - Surcharge
 * - Health & Education Cess
 * - Section 87A Rebate
 */
export class IndiaTaxCalculator {
  // =========================================================================
  // TAX SLABS FY 2024-25
  // =========================================================================

  /**
   * New Tax Regime Slabs (Default from FY 2023-24)
   * After Budget 2024 amendments
   */
  private static readonly NEW_REGIME_SLABS = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300001, max: 700000, rate: 0.05 },
    { min: 700001, max: 1000000, rate: 0.10 },
    { min: 1000001, max: 1200000, rate: 0.15 },
    { min: 1200001, max: 1500000, rate: 0.20 },
    { min: 1500001, max: Infinity, rate: 0.30 },
  ];

  /**
   * Old Tax Regime Slabs
   */
  private static readonly OLD_REGIME_SLABS = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250001, max: 500000, rate: 0.05 },
    { min: 500001, max: 1000000, rate: 0.20 },
    { min: 1000001, max: Infinity, rate: 0.30 },
  ];

  /**
   * Senior Citizen (60-80 years) Old Regime Slabs
   */
  private static readonly OLD_REGIME_SLABS_SENIOR = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300001, max: 500000, rate: 0.05 },
    { min: 500001, max: 1000000, rate: 0.20 },
    { min: 1000001, max: Infinity, rate: 0.30 },
  ];

  /**
   * Super Senior Citizen (80+ years) Old Regime Slabs
   */
  private static readonly OLD_REGIME_SLABS_SUPER_SENIOR = [
    { min: 0, max: 500000, rate: 0 },
    { min: 500001, max: 1000000, rate: 0.20 },
    { min: 1000001, max: Infinity, rate: 0.30 },
  ];

  // =========================================================================
  // SURCHARGE SLABS
  // =========================================================================

  private static readonly SURCHARGE_SLABS = [
    { min: 0, max: 5000000, rate: 0 },
    { min: 5000001, max: 10000000, rate: 0.10 },
    { min: 10000001, max: 20000000, rate: 0.15 },
    { min: 20000001, max: 50000000, rate: 0.25 },
    { min: 50000001, max: Infinity, rate: 0.37 },
  ];

  /**
   * New Regime Surcharge (capped at 25% for income above 2 cr)
   */
  private static readonly NEW_REGIME_SURCHARGE_SLABS = [
    { min: 0, max: 5000000, rate: 0 },
    { min: 5000001, max: 10000000, rate: 0.10 },
    { min: 10000001, max: 20000000, rate: 0.15 },
    { min: 20000001, max: Infinity, rate: 0.25 }, // Capped at 25%
  ];

  // =========================================================================
  // CONSTANTS
  // =========================================================================

  static readonly STANDARD_DEDUCTION = 50000; // Applicable to both regimes from FY 2024-25
  static readonly CESS_RATE = 0.04; // 4% Health & Education Cess
  static readonly REBATE_87A_LIMIT_NEW = 700000; // Rebate for income up to 7L in new regime
  static readonly REBATE_87A_LIMIT_OLD = 500000; // Rebate for income up to 5L in old regime
  static readonly REBATE_87A_MAX_NEW = 25000; // Maximum rebate in new regime
  static readonly REBATE_87A_MAX_OLD = 12500; // Maximum rebate in old regime

  // Section 80C limit
  static readonly SECTION_80C_LIMIT = 150000;

  // Section 80D limits
  static readonly SECTION_80D_SELF_LIMIT = 25000;
  static readonly SECTION_80D_SELF_SENIOR_LIMIT = 50000;
  static readonly SECTION_80D_PARENTS_LIMIT = 25000;
  static readonly SECTION_80D_PARENTS_SENIOR_LIMIT = 50000;

  // =========================================================================
  // MAIN CALCULATION METHODS
  // =========================================================================

  /**
   * Calculate annual TDS based on projected income
   */
  static calculateAnnualTDS(
    annualGrossIncome: number,
    regime: 'OLD' | 'NEW',
    declarations?: IndiaTaxDeclarations,
    age?: number
  ): IndiaTDSDetails {
    const exemptions: Record<string, number> = {};
    const deductions: Record<string, number> = {};

    // Standard deduction (applicable to both regimes from FY 2024-25)
    deductions['standardDeduction'] = this.STANDARD_DEDUCTION;

    let taxableIncome = annualGrossIncome - this.STANDARD_DEDUCTION;

    if (regime === 'OLD' && declarations) {
      // Calculate HRA exemption
      if (declarations.hraDetails?.rentPaid) {
        const hraExemption = this.calculateHRAExemption(
          annualGrossIncome,
          declarations.hraDetails.rentPaid * 12,
          declarations
        );
        exemptions['HRA'] = hraExemption;
        taxableIncome -= hraExemption;
      }

      // Section 80C deductions
      const section80C = this.calculateSection80C(declarations.section80C);
      if (section80C > 0) {
        deductions['section80C'] = section80C;
        taxableIncome -= section80C;
      }

      // Section 80D deductions
      const section80D = this.calculateSection80D(declarations.section80D, age);
      if (section80D > 0) {
        deductions['section80D'] = section80D;
        taxableIncome -= section80D;
      }

      // Section 80E (Education Loan Interest)
      if (declarations.section80E && declarations.section80E > 0) {
        deductions['section80E'] = declarations.section80E;
        taxableIncome -= declarations.section80E;
      }

      // Section 24 (Home Loan Interest)
      if (declarations.section24 && declarations.section24 > 0) {
        const section24 = Math.min(declarations.section24, 200000);
        deductions['section24'] = section24;
        taxableIncome -= section24;
      }

      // Section 80G (Donations)
      if (declarations.section80G && declarations.section80G > 0) {
        const section80G = Math.min(declarations.section80G, taxableIncome * 0.1);
        deductions['section80G'] = section80G;
        taxableIncome -= section80G;
      }
    }

    // Ensure taxable income is not negative
    taxableIncome = Math.max(0, taxableIncome);

    // Calculate base tax
    const slabs = this.getApplicableSlabs(regime, age);
    let taxBeforeRebate = this.calculateSlabwiseTax(taxableIncome, slabs);

    // Apply Section 87A rebate
    let rebate87A = 0;
    if (regime === 'NEW' && taxableIncome <= this.REBATE_87A_LIMIT_NEW) {
      rebate87A = Math.min(taxBeforeRebate, this.REBATE_87A_MAX_NEW);
    } else if (regime === 'OLD' && taxableIncome <= this.REBATE_87A_LIMIT_OLD) {
      rebate87A = Math.min(taxBeforeRebate, this.REBATE_87A_MAX_OLD);
    }

    const taxAfterRebate = taxBeforeRebate - rebate87A;

    // Calculate surcharge
    const surchargeSlabs = regime === 'NEW'
      ? this.NEW_REGIME_SURCHARGE_SLABS
      : this.SURCHARGE_SLABS;
    const surcharge = this.calculateSurcharge(taxAfterRebate, taxableIncome, surchargeSlabs);

    // Calculate cess
    const taxWithSurcharge = taxAfterRebate + surcharge;
    const cess = Math.round(taxWithSurcharge * this.CESS_RATE);

    // Total tax
    const totalTax = taxWithSurcharge + cess;

    // Monthly TDS
    const monthlyTDS = Math.round(totalTax / 12);

    return {
      regime,
      grossIncome: annualGrossIncome,
      exemptions,
      deductions,
      taxableIncome: Math.round(taxableIncome),
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      cess,
      totalTax: Math.round(totalTax),
      monthlyTDS,
    };
  }

  /**
   * Calculate monthly TDS based on YTD income and projections
   */
  static calculateMonthlyTDS(
    monthlyGross: number,
    ytdGross: number,
    currentMonth: number, // 1-12 in financial year
    regime: 'OLD' | 'NEW',
    declarations?: IndiaTaxDeclarations,
    ytdTDSDeducted?: number
  ): number {
    // Project annual income
    const remainingMonths = 12 - currentMonth + 1;
    const projectedAnnualIncome = ytdGross + (monthlyGross * remainingMonths);

    // Calculate annual TDS
    const annualTDS = this.calculateAnnualTDS(projectedAnnualIncome, regime, declarations);

    // Calculate remaining TDS to be deducted
    const remainingTDS = annualTDS.totalTax - (ytdTDSDeducted || 0);

    // Distribute over remaining months
    const monthlyTDS = Math.max(0, Math.round(remainingTDS / remainingMonths));

    return monthlyTDS;
  }

  /**
   * Compare tax liability between old and new regime
   */
  static compareRegimes(
    annualGrossIncome: number,
    declarations?: IndiaTaxDeclarations,
    age?: number
  ): { oldRegime: IndiaTDSDetails; newRegime: IndiaTDSDetails; recommendation: 'OLD' | 'NEW'; savings: number } {
    const oldRegime = this.calculateAnnualTDS(annualGrossIncome, 'OLD', declarations, age);
    const newRegime = this.calculateAnnualTDS(annualGrossIncome, 'NEW', undefined, age);

    const recommendation = oldRegime.totalTax <= newRegime.totalTax ? 'OLD' : 'NEW';
    const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);

    return {
      oldRegime,
      newRegime,
      recommendation,
      savings,
    };
  }

  // =========================================================================
  // EXEMPTION CALCULATIONS
  // =========================================================================

  /**
   * Calculate HRA exemption
   * Minimum of:
   * 1. Actual HRA received
   * 2. Rent paid - 10% of basic salary
   * 3. 50% of basic (metro) / 40% of basic (non-metro)
   */
  static calculateHRAExemption(
    annualBasic: number,
    annualRentPaid: number,
    declarations?: IndiaTaxDeclarations,
    cityType: 'metro' | 'non-metro' = 'non-metro',
    annualHRA?: number
  ): number {
    if (!annualRentPaid || annualRentPaid === 0) {
      return 0;
    }

    // Default HRA as 40% of basic if not provided
    const hra = annualHRA || (annualBasic * 0.4);

    const option1 = hra; // Actual HRA
    const option2 = Math.max(0, annualRentPaid - (annualBasic * 0.1)); // Rent - 10% basic
    const option3 = cityType === 'metro' ? annualBasic * 0.5 : annualBasic * 0.4; // 50% or 40%

    return Math.min(option1, option2, option3);
  }

  /**
   * Calculate LTA exemption
   * Actual travel expenses or limit, whichever is lower
   */
  static calculateLTAExemption(
    ltaReceived: number,
    actualTravelExpense: number
  ): number {
    return Math.min(ltaReceived, actualTravelExpense);
  }

  // =========================================================================
  // DEDUCTION CALCULATIONS
  // =========================================================================

  /**
   * Calculate Section 80C deductions (max 1.5L)
   */
  static calculateSection80C(
    declarations?: IndiaTaxDeclarations['section80C']
  ): number {
    if (!declarations) return 0;

    const total =
      (declarations.ppf || 0) +
      (declarations.elss || 0) +
      (declarations.lifeInsurance || 0) +
      (declarations.nsc || 0) +
      (declarations.tuitionFees || 0) +
      (declarations.homeLoanPrincipal || 0) +
      (declarations.others || 0);

    return Math.min(total, this.SECTION_80C_LIMIT);
  }

  /**
   * Calculate Section 80D deductions (Medical Insurance)
   */
  static calculateSection80D(
    declarations?: IndiaTaxDeclarations['section80D'],
    age?: number
  ): number {
    if (!declarations) return 0;

    const isSenior = age && age >= 60;
    const selfLimit = isSenior ? this.SECTION_80D_SELF_SENIOR_LIMIT : this.SECTION_80D_SELF_LIMIT;

    const selfDeduction = Math.min(declarations.selfAndFamily || 0, selfLimit);

    const parentsLimit = declarations.parentsAreSenior
      ? this.SECTION_80D_PARENTS_SENIOR_LIMIT
      : this.SECTION_80D_PARENTS_LIMIT;

    const parentsDeduction = Math.min(declarations.parents || 0, parentsLimit);

    return selfDeduction + parentsDeduction;
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  /**
   * Get applicable tax slabs based on regime and age
   */
  private static getApplicableSlabs(
    regime: 'OLD' | 'NEW',
    age?: number
  ): Array<{ min: number; max: number; rate: number }> {
    if (regime === 'NEW') {
      return this.NEW_REGIME_SLABS;
    }

    // Old regime - check for senior citizen slabs
    if (age && age >= 80) {
      return this.OLD_REGIME_SLABS_SUPER_SENIOR;
    } else if (age && age >= 60) {
      return this.OLD_REGIME_SLABS_SENIOR;
    }

    return this.OLD_REGIME_SLABS;
  }

  /**
   * Calculate tax based on slabs
   */
  private static calculateSlabwiseTax(
    taxableIncome: number,
    slabs: Array<{ min: number; max: number; rate: number }>
  ): number {
    let tax = 0;

    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min + 1;
        tax += taxableInSlab * slab.rate;
      }
    }

    return Math.round(tax);
  }

  /**
   * Calculate surcharge
   */
  private static calculateSurcharge(
    taxAmount: number,
    taxableIncome: number,
    slabs: Array<{ min: number; max: number; rate: number }>
  ): number {
    for (const slab of slabs) {
      if (taxableIncome >= slab.min && taxableIncome <= slab.max) {
        return Math.round(taxAmount * slab.rate);
      }
    }
    return 0;
  }

  /**
   * Get effective tax rate
   */
  static getEffectiveTaxRate(totalTax: number, grossIncome: number): number {
    if (grossIncome === 0) return 0;
    return Math.round((totalTax / grossIncome) * 10000) / 100; // Percentage with 2 decimals
  }

  /**
   * Get marginal tax rate
   */
  static getMarginalTaxRate(
    taxableIncome: number,
    regime: 'OLD' | 'NEW',
    age?: number
  ): number {
    const slabs = this.getApplicableSlabs(regime, age);

    for (const slab of slabs) {
      if (taxableIncome >= slab.min && taxableIncome <= slab.max) {
        return slab.rate * 100;
      }
    }

    return 30; // Default highest slab
  }
}
