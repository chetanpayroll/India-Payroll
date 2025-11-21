// ============================================================================
// INDIA PAYROLL ENGINE - COMPLETE IMPLEMENTATION
// ============================================================================

import {
  BasePayrollEngine,
  IPayrollEngine,
  PayrollProcessingOptions,
} from '../../core/IPayrollEngine';
import {
  CountryCode,
  ValidationResult,
  ValidationError,
  SalaryComponents,
  Deductions,
  PayrollData,
  PayrollPeriod,
  Payslip,
  Report,
  PayrollEarning,
  PayrollDeduction,
  EmployerContribution,
  IndiaEmployee,
  IndiaSalaryStructure,
} from '../../core/types';
import { IndiaTaxCalculator } from './IndiaTaxCalculator';
import { IndiaStatutoryCalculator } from './IndiaStatutoryCalculator';
import { IndiaValidator } from './IndiaValidator';
import { getCountryConfig } from '../../core/countryConfig';

/**
 * India Payroll Engine
 *
 * Complete implementation of payroll processing for India including:
 * - Salary structure (Basic, HRA, LTA, Special Allowances)
 * - PF (Provident Fund) calculations
 * - ESIC (Employee State Insurance)
 * - Professional Tax (state-wise)
 * - TDS (Tax Deducted at Source)
 * - LWF (Labour Welfare Fund)
 * - Gratuity
 * - Compliance reports
 */
export class IndiaPayrollEngine extends BasePayrollEngine implements IPayrollEngine {
  readonly countryCode: CountryCode = 'INDIA';
  readonly version = '1.0.0';

  private config = getCountryConfig('INDIA');

  // =========================================================================
  // VALIDATION METHODS
  // =========================================================================

  validateEmployee(employee: IndiaEmployee): ValidationResult {
    return IndiaValidator.validateEmployee(employee);
  }

  validateSalaryStructure(salaryComponents: SalaryComponents): ValidationResult {
    const errors: ValidationError[] = [];

    if (!salaryComponents.basic || salaryComponents.basic <= 0) {
      errors.push({
        field: 'basic',
        code: 'INVALID_BASIC',
        message: 'Basic salary must be greater than 0',
      });
    }

    // HRA should typically be 40-50% of basic
    const hra = salaryComponents.allowances?.hra || 0;
    if (hra > salaryComponents.basic) {
      errors.push({
        field: 'hra',
        code: 'EXCESSIVE_HRA',
        message: 'HRA should not exceed basic salary',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validatePayrollPeriod(period: PayrollPeriod): ValidationResult {
    const errors: ValidationError[] = [];

    if (period.month < 1 || period.month > 12) {
      errors.push({
        field: 'month',
        code: 'INVALID_MONTH',
        message: 'Month must be between 1 and 12',
      });
    }

    if (period.year < 2000 || period.year > 2100) {
      errors.push({
        field: 'year',
        code: 'INVALID_YEAR',
        message: 'Year must be between 2000 and 2100',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // =========================================================================
  // SALARY CALCULATIONS
  // =========================================================================

  calculateGrossSalary(components: SalaryComponents, period?: PayrollPeriod): number {
    let gross = components.basic;

    // Add all allowances
    if (components.allowances) {
      gross += Object.values(components.allowances).reduce((sum, val) => sum + (val || 0), 0);
    }

    // Add all earnings
    if (components.earnings) {
      gross += Object.values(components.earnings).reduce((sum, val) => sum + (val || 0), 0);
    }

    // Pro-rate if needed
    if (period && period.presentDays !== undefined && period.workingDays) {
      const proRateFactor = period.presentDays / period.workingDays;
      gross = Math.round(gross * proRateFactor);
    }

    return Math.round(gross * 100) / 100;
  }

  calculateDeductions(
    grossSalary: number,
    employee: IndiaEmployee,
    period?: PayrollPeriod
  ): Deductions {
    const statutory: Record<string, number> = {};
    const voluntary: Record<string, number> = {};

    // 1. Provident Fund
    if (employee.pfApplicable) {
      const pfDetails = IndiaStatutoryCalculator.calculatePF(
        employee.salaryStructure.basic,
        0 // DA if any
      );
      statutory['PF'] = pfDetails.employeeContribution;
    }

    // 2. ESIC
    if (employee.esicApplicable) {
      const esicDetails = IndiaStatutoryCalculator.calculateESIC(grossSalary);
      if (esicDetails.isApplicable) {
        statutory['ESIC'] = esicDetails.employeeContribution;
      }
    }

    // 3. Professional Tax
    if (employee.ptApplicable) {
      const ptDetails = IndiaStatutoryCalculator.calculatePT(
        grossSalary,
        employee.state,
        period?.month
      );
      statutory['PT'] = ptDetails.ptAmount;
    }

    // 4. LWF (if applicable for the month)
    if (employee.lwfApplicable && period) {
      const lwfDetails = IndiaStatutoryCalculator.calculateLWF(
        employee.state,
        period.month
      );
      if (lwfDetails.isApplicable) {
        statutory['LWF'] = lwfDetails.employee;
      }
    }

    // 5. TDS
    const tdsDetails = this.calculateMonthlyTDS(employee, grossSalary, period);
    if (tdsDetails > 0) {
      statutory['TDS'] = tdsDetails;
    }

    const total = Object.values(statutory).reduce((sum, val) => sum + val, 0) +
      Object.values(voluntary).reduce((sum, val) => sum + val, 0);

    return {
      statutory,
      voluntary,
      total: Math.round(total * 100) / 100,
    };
  }

  calculateEmployerContributions(employee: IndiaEmployee, grossSalary: number): Record<string, number> {
    const contributions: Record<string, number> = {};

    // PF Employer Contribution
    if (employee.pfApplicable) {
      const pfDetails = IndiaStatutoryCalculator.calculatePF(
        employee.salaryStructure.basic,
        0
      );
      contributions['PF_Employer'] = pfDetails.employerContribution;
      contributions['PF_Admin'] = pfDetails.adminCharges || 0;
      contributions['EDLI'] = pfDetails.edliCharges || 0;
    }

    // ESIC Employer Contribution
    if (employee.esicApplicable) {
      const esicDetails = IndiaStatutoryCalculator.calculateESIC(grossSalary);
      if (esicDetails.isApplicable) {
        contributions['ESIC_Employer'] = esicDetails.employerContribution;
      }
    }

    return contributions;
  }

  // =========================================================================
  // INDIA-SPECIFIC CALCULATIONS
  // =========================================================================

  /**
   * Calculate HRA (House Rent Allowance)
   */
  calculateHRA(basic: number, cityType: 'metro' | 'non-metro'): number {
    // Standard HRA is 50% for metro, 40% for non-metro
    const rate = cityType === 'metro' ? 0.5 : 0.4;
    return Math.round(basic * rate);
  }

  /**
   * Calculate LTA (Leave Travel Allowance)
   */
  calculateLTA(basic: number): number {
    // Standard LTA is typically 8.33% of basic (1 month's basic per year)
    return Math.round(basic * 0.0833);
  }

  /**
   * Calculate monthly TDS
   */
  private calculateMonthlyTDS(
    employee: IndiaEmployee,
    monthlyGross: number,
    period?: PayrollPeriod
  ): number {
    // Project annual income
    const annualGross = monthlyGross * 12;

    // Get current month in financial year (April = 1, March = 12)
    let fyMonth = 1;
    if (period) {
      fyMonth = period.month >= 4 ? period.month - 3 : period.month + 9;
    }

    // Calculate TDS
    const tdsDetails = IndiaTaxCalculator.calculateAnnualTDS(
      annualGross,
      employee.taxRegime,
      employee.declarations
    );

    return tdsDetails.monthlyTDS;
  }

  // =========================================================================
  // PAYROLL PROCESSING
  // =========================================================================

  protected buildSalaryComponents(
    employee: IndiaEmployee,
    options?: PayrollProcessingOptions
  ): SalaryComponents {
    const structure = employee.salaryStructure;

    const allowances: Record<string, number> = {
      hra: structure.hra || 0,
      lta: structure.lta || 0,
      specialAllowance: structure.specialAllowance || 0,
      conveyance: structure.conveyance || 0,
      medicalAllowance: structure.medicalAllowance || 0,
    };

    // Add other allowances
    if (structure.otherAllowances) {
      Object.entries(structure.otherAllowances).forEach(([key, value]) => {
        allowances[key] = value;
      });
    }

    const earnings: Record<string, number> = {};

    // Add bonus if provided
    if (options?.bonus) {
      earnings['bonus'] = options.bonus;
    }

    // Add additional earnings
    if (options?.additionalEarnings) {
      options.additionalEarnings.forEach((earning) => {
        earnings[earning.code] = earning.amount;
      });
    }

    return {
      basic: structure.basic,
      allowances,
      earnings,
    };
  }

  protected buildPayrollData(
    employee: IndiaEmployee,
    period: PayrollPeriod,
    components: SalaryComponents,
    grossSalary: number,
    deductions: Deductions,
    netSalary: number,
    employerContributions: Record<string, number>,
    options?: PayrollProcessingOptions
  ): PayrollData {
    // Build earnings array
    const earnings: PayrollEarning[] = [
      { code: 'BASIC', name: 'Basic Salary', amount: components.basic, isTaxable: true },
    ];

    // Add allowances
    Object.entries(components.allowances).forEach(([code, amount]) => {
      if (amount > 0) {
        earnings.push({
          code: code.toUpperCase(),
          name: this.formatAllowanceName(code),
          amount,
          isTaxable: !['hra', 'lta'].includes(code.toLowerCase()),
        });
      }
    });

    // Add other earnings
    Object.entries(components.earnings).forEach(([code, amount]) => {
      if (amount > 0) {
        earnings.push({
          code: code.toUpperCase(),
          name: this.formatEarningName(code),
          amount,
          isTaxable: true,
        });
      }
    });

    // Build deductions array
    const deductionsList: PayrollDeduction[] = [];

    Object.entries(deductions.statutory).forEach(([code, amount]) => {
      if (amount > 0) {
        deductionsList.push({
          code,
          name: this.formatDeductionName(code),
          amount,
          isStatutory: true,
        });
      }
    });

    Object.entries(deductions.voluntary).forEach(([code, amount]) => {
      if (amount > 0) {
        deductionsList.push({
          code,
          name: this.formatDeductionName(code),
          amount,
          isStatutory: false,
        });
      }
    });

    // Build employer contributions array
    const employerContributionsList: EmployerContribution[] = Object.entries(employerContributions).map(
      ([code, amount]) => ({
        code,
        name: this.formatContributionName(code),
        amount,
      })
    );

    // Calculate tax details
    const annualGross = grossSalary * 12;
    const taxDetails = IndiaTaxCalculator.calculateAnnualTDS(
      annualGross,
      employee.taxRegime,
      employee.declarations
    );

    return {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      designation: employee.designation,
      payPeriod: period,
      earnings,
      deductions: deductionsList,
      grossSalary,
      totalDeductions: deductions.total,
      netSalary,
      employerContributions: employerContributionsList,
      taxDetails: {
        taxableIncome: taxDetails.taxableIncome,
        taxAmount: taxDetails.taxBeforeRebate,
        surcharge: taxDetails.surcharge,
        cess: taxDetails.cess,
        totalTax: taxDetails.totalTax,
        regime: taxDetails.regime,
        exemptions: taxDetails.exemptions,
      },
      metadata: {
        country: 'INDIA',
        financialYear: this.getFinancialYear(new Date(period.year, period.month - 1, 1)),
        processedAt: new Date().toISOString(),
      },
    };
  }

  // =========================================================================
  // DOCUMENT GENERATION
  // =========================================================================

  generatePayslip(data: PayrollData): Payslip {
    return {
      id: `PS-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      employeeCode: data.employeeCode,
      designation: data.designation,
      department: data.department,

      payPeriod: data.payPeriod,
      payDate: new Date(),

      countrySpecificIds: {},

      earnings: data.earnings,
      grossEarnings: data.grossSalary,

      deductions: data.deductions,
      totalDeductions: data.totalDeductions,

      netPay: data.netSalary,
      netPayInWords: this.amountToWords(data.netSalary),

      employerContributions: data.employerContributions,

      taxDetails: data.taxDetails,

      status: 'generated',
      generatedAt: new Date(),
    };
  }

  generateComplianceReports(
    period: PayrollPeriod,
    employees: IndiaEmployee[],
    payrollData: PayrollData[]
  ): Report[] {
    const reports: Report[] = [];
    const fy = this.getFinancialYear(new Date(period.year, period.month - 1, 1));

    // PF ECR Report
    reports.push({
      id: `PF-ECR-${period.year}-${period.month}`,
      type: 'PF_ECR',
      name: `PF ECR - ${this.formatMonthYear(period.month, period.year)}`,
      country: 'INDIA',
      period,
      data: this.generatePFECRData(employees, payrollData),
      format: 'excel',
      generatedAt: new Date(),
      status: 'generated',
    });

    // ESIC Report
    const esicEmployees = employees.filter((e) => e.esicApplicable);
    if (esicEmployees.length > 0) {
      reports.push({
        id: `ESIC-${period.year}-${period.month}`,
        type: 'ESIC_MONTHLY',
        name: `ESIC Monthly - ${this.formatMonthYear(period.month, period.year)}`,
        country: 'INDIA',
        period,
        data: this.generateESICData(esicEmployees, payrollData),
        format: 'excel',
        generatedAt: new Date(),
        status: 'generated',
      });
    }

    // PT Report
    reports.push({
      id: `PT-${period.year}-${period.month}`,
      type: 'PT_MONTHLY',
      name: `Professional Tax - ${this.formatMonthYear(period.month, period.year)}`,
      country: 'INDIA',
      period,
      data: this.generatePTData(employees, payrollData),
      format: 'excel',
      generatedAt: new Date(),
      status: 'generated',
    });

    return reports;
  }

  private generatePFECRData(employees: IndiaEmployee[], payrollData: PayrollData[]): any {
    const records = employees
      .filter((e) => e.pfApplicable)
      .map((employee) => {
        const data = payrollData.find((p) => p.employeeId === employee.id);
        const pfDeduction = data?.deductions.find((d) => d.code === 'PF')?.amount || 0;
        const basic = employee.salaryStructure.basic;

        return {
          uan: employee.uan || '',
          memberName: `${employee.firstName} ${employee.lastName}`,
          grossWages: data?.grossSalary || 0,
          epfWages: Math.min(basic, 15000),
          epsWages: Math.min(basic, 15000),
          edliWages: Math.min(basic, 15000),
          epfContribution: pfDeduction,
          epsContribution: Math.round(Math.min(basic, 15000) * 0.0833),
          epfEPSDiff: 0,
          ncp: 0,
        };
      });

    return {
      records,
      summary: {
        totalMembers: records.length,
        totalEPFContribution: records.reduce((s, r) => s + r.epfContribution, 0),
        totalEPSContribution: records.reduce((s, r) => s + r.epsContribution, 0),
      },
    };
  }

  private generateESICData(employees: IndiaEmployee[], payrollData: PayrollData[]): any {
    return employees.map((employee) => {
      const data = payrollData.find((p) => p.employeeId === employee.id);
      const esicDeduction = data?.deductions.find((d) => d.code === 'ESIC')?.amount || 0;
      const gross = data?.grossSalary || 0;

      return {
        esicNumber: employee.esicNumber || '',
        name: `${employee.firstName} ${employee.lastName}`,
        grossWages: gross,
        employeeContribution: esicDeduction,
        employerContribution: Math.round(gross * 0.0325),
        ipDays: 30,
      };
    });
  }

  private generatePTData(employees: IndiaEmployee[], payrollData: PayrollData[]): any {
    const stateWiseData: Record<string, any[]> = {};

    employees.forEach((employee) => {
      if (!employee.ptApplicable) return;

      const data = payrollData.find((p) => p.employeeId === employee.id);
      const ptDeduction = data?.deductions.find((d) => d.code === 'PT')?.amount || 0;

      if (!stateWiseData[employee.state]) {
        stateWiseData[employee.state] = [];
      }

      stateWiseData[employee.state].push({
        name: `${employee.firstName} ${employee.lastName}`,
        grossSalary: data?.grossSalary || 0,
        ptAmount: ptDeduction,
      });
    });

    return stateWiseData;
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  getWorkingDays(month: number, year: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Exclude Sunday (0) and Saturday (6)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  amountToWords(amount: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = 'Rupees ' + numToWords(rupees);
    if (paise > 0) {
      result += ' and ' + numToWords(paise) + ' Paise';
    }
    result += ' Only';

    return result;
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private formatMonthYear(month: number, year: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month - 1]} ${year}`;
  }

  private formatAllowanceName(code: string): string {
    const names: Record<string, string> = {
      hra: 'House Rent Allowance',
      lta: 'Leave Travel Allowance',
      specialAllowance: 'Special Allowance',
      conveyance: 'Conveyance Allowance',
      medicalAllowance: 'Medical Allowance',
    };
    return names[code] || code.replace(/([A-Z])/g, ' $1').trim();
  }

  private formatEarningName(code: string): string {
    const names: Record<string, string> = {
      bonus: 'Bonus',
      incentive: 'Incentive',
      overtime: 'Overtime',
    };
    return names[code] || code.replace(/([A-Z])/g, ' $1').trim();
  }

  private formatDeductionName(code: string): string {
    const names: Record<string, string> = {
      PF: 'Provident Fund',
      ESIC: 'ESI Contribution',
      PT: 'Professional Tax',
      TDS: 'Tax Deducted at Source',
      LWF: 'Labour Welfare Fund',
    };
    return names[code] || code;
  }

  private formatContributionName(code: string): string {
    const names: Record<string, string> = {
      PF_Employer: 'PF (Employer)',
      PF_Admin: 'PF Admin Charges',
      EDLI: 'EDLI Charges',
      ESIC_Employer: 'ESIC (Employer)',
    };
    return names[code] || code.replace(/_/g, ' ');
  }
}
