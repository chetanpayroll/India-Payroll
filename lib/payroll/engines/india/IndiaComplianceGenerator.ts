// ============================================================================
// INDIA COMPLIANCE GENERATOR
// Form 24Q, PF ECR, ESIC, PT Challans
// ============================================================================

import {
  IndiaForm24Q,
  IndiaPFECR,
  IndiaESICMonthly,
  PayrollPeriod,
  PayrollData,
  IndiaEmployee,
} from '../../core/types';

/**
 * India Compliance Generator
 *
 * Generates compliance reports required by Indian statutory authorities:
 * - Form 24Q (TDS Quarterly Statement)
 * - PF ECR (Electronic Challan cum Return)
 * - ESIC Monthly Contribution
 * - Professional Tax Challan
 * - Form 16 (Annual TDS Certificate)
 */
export class IndiaComplianceGenerator {
  // =========================================================================
  // FORM 24Q - TDS QUARTERLY STATEMENT
  // =========================================================================

  /**
   * Generate Form 24Q data for TDS quarterly filing
   * Due dates: Q1 (July 31), Q2 (Oct 31), Q3 (Jan 31), Q4 (May 31)
   */
  static generateForm24Q(
    quarter: 1 | 2 | 3 | 4,
    financialYear: string,
    tanNumber: string,
    employerName: string,
    employees: IndiaEmployee[],
    payrollData: PayrollData[]
  ): IndiaForm24Q {
    // Get months for the quarter
    const quarterMonths = this.getQuarterMonths(quarter);

    // Filter payroll data for the quarter
    const quarterPayroll = payrollData.filter((p) => {
      const fyMonth = this.getFYMonth(p.payPeriod.month);
      return quarterMonths.includes(fyMonth);
    });

    // Aggregate by employee
    const employeeMap = new Map<string, {
      pan: string;
      name: string;
      totalPaid: number;
      totalTDS: number;
      payments: Array<{ date: Date; amount: number; tds: number }>;
    }>();

    quarterPayroll.forEach((payroll) => {
      const employee = employees.find((e) => e.id === payroll.employeeId);
      if (!employee) return;

      const existing = employeeMap.get(payroll.employeeId);
      const tdsAmount = payroll.deductions.find((d) => d.code === 'TDS')?.amount || 0;

      if (existing) {
        existing.totalPaid += payroll.grossSalary;
        existing.totalTDS += tdsAmount;
        existing.payments.push({
          date: payroll.payPeriod.endDate,
          amount: payroll.grossSalary,
          tds: tdsAmount,
        });
      } else {
        employeeMap.set(payroll.employeeId, {
          pan: employee.pan,
          name: `${employee.firstName} ${employee.lastName}`,
          totalPaid: payroll.grossSalary,
          totalTDS: tdsAmount,
          payments: [{
            date: payroll.payPeriod.endDate,
            amount: payroll.grossSalary,
            tds: tdsAmount,
          }],
        });
      }
    });

    // Build Form 24Q structure
    const employeeRecords = Array.from(employeeMap.values()).map((emp) => ({
      pan: emp.pan,
      name: emp.name,
      section: '192', // Salary income
      paymentDate: emp.payments[emp.payments.length - 1].date,
      amountPaid: emp.totalPaid,
      tdsDeducted: emp.totalTDS,
    }));

    return {
      quarter,
      financialYear,
      tanNumber,
      employerName,
      employees: employeeRecords,
      totalAmount: employeeRecords.reduce((sum, e) => sum + e.amountPaid, 0),
      totalTDS: employeeRecords.reduce((sum, e) => sum + e.tdsDeducted, 0),
    };
  }

  // =========================================================================
  // PF ECR - ELECTRONIC CHALLAN CUM RETURN
  // =========================================================================

  /**
   * Generate PF ECR file for monthly filing
   * Due date: 15th of following month
   */
  static generatePFECR(
    month: number,
    year: number,
    establishmentCode: string,
    establishmentName: string,
    employees: IndiaEmployee[],
    payrollData: PayrollData[]
  ): IndiaPFECR {
    // Filter PF-applicable employees and their payroll
    const pfEmployees = employees.filter((e) => e.pfApplicable);

    const records = pfEmployees.map((employee) => {
      const payroll = payrollData.find(
        (p) => p.employeeId === employee.id &&
          p.payPeriod.month === month &&
          p.payPeriod.year === year
      );

      if (!payroll) {
        return null;
      }

      const basic = employee.salaryStructure.basic;
      const pfWage = Math.min(basic, 15000);
      const gross = payroll.grossSalary;

      // Calculate contributions
      const epfContribution = Math.round(pfWage * 0.12); // Employee's EPF
      const epsContribution = Math.round(pfWage * 0.0833); // Employer's EPS (8.33%)
      const epfEPSDiff = Math.round(pfWage * 0.0367); // Employer's EPF (3.67%)

      return {
        uan: employee.uan || '',
        memberName: `${employee.firstName} ${employee.lastName}`,
        grossWages: Math.round(gross),
        epfWages: pfWage,
        epsWages: pfWage,
        edliWages: pfWage,
        epfContribution,
        epsContribution,
        epfEPSDiff,
        ncp: 0, // Non-Contributing Period days
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    // Calculate summary
    const totalEPFContribution = records.reduce((sum, r) => sum + r.epfContribution, 0);
    const totalEPSContribution = records.reduce((sum, r) => sum + r.epsContribution, 0);
    const totalEPFEPSDiff = records.reduce((sum, r) => sum + r.epfEPSDiff, 0);

    // Admin charges (0.5% on total PF wages, minimum ₹500)
    const totalPFWages = records.reduce((sum, r) => sum + r.epfWages, 0);
    const adminCharges = Math.max(500, Math.round(totalPFWages * 0.005));

    // EDLI charges (0.5%)
    const edliCharges = Math.round(totalPFWages * 0.005);

    return {
      month,
      year,
      establishmentCode,
      establishmentName,
      records,
      summary: {
        totalEPFContribution,
        totalEPSContribution,
        totalEPFEPSDiff,
        adminCharges,
        totalDues: totalEPFContribution + totalEPSContribution + totalEPFEPSDiff + adminCharges + edliCharges,
      },
    };
  }

  // =========================================================================
  // ESIC MONTHLY CONTRIBUTION
  // =========================================================================

  /**
   * Generate ESIC monthly contribution data
   * Due date: 15th of following month
   */
  static generateESICMonthly(
    month: number,
    year: number,
    establishmentCode: string,
    employees: IndiaEmployee[],
    payrollData: PayrollData[]
  ): IndiaESICMonthly {
    // Filter ESIC-applicable employees
    const esicEmployees = employees.filter((e) => e.esicApplicable);

    const records = esicEmployees.map((employee) => {
      const payroll = payrollData.find(
        (p) => p.employeeId === employee.id &&
          p.payPeriod.month === month &&
          p.payPeriod.year === year
      );

      if (!payroll) {
        return null;
      }

      const gross = payroll.grossSalary;

      // Only applicable if gross <= 21000
      if (gross > 21000) {
        return null;
      }

      return {
        esicNumber: employee.esicNumber || '',
        name: `${employee.firstName} ${employee.lastName}`,
        grossWages: Math.round(gross),
        employeeContribution: Math.round(gross * 0.0075), // 0.75%
        employerContribution: Math.round(gross * 0.0325), // 3.25%
        ipDays: 30, // IP Days (working days)
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    const totalContribution = records.reduce(
      (sum, r) => sum + r.employeeContribution + r.employerContribution,
      0
    );

    return {
      month,
      year,
      establishmentCode,
      records,
      totalContribution,
    };
  }

  // =========================================================================
  // PROFESSIONAL TAX CHALLAN
  // =========================================================================

  /**
   * Generate PT challan data (state-wise)
   */
  static generatePTChallan(
    month: number,
    year: number,
    state: string,
    employees: IndiaEmployee[],
    payrollData: PayrollData[]
  ): {
    state: string;
    month: number;
    year: number;
    totalEmployees: number;
    totalPT: number;
    records: Array<{
      name: string;
      gross: number;
      pt: number;
    }>;
  } {
    // Filter employees by state
    const stateEmployees = employees.filter(
      (e) => e.state.toUpperCase().replace(/\s+/g, '_') === state.toUpperCase().replace(/\s+/g, '_') &&
        e.ptApplicable
    );

    const records = stateEmployees.map((employee) => {
      const payroll = payrollData.find(
        (p) => p.employeeId === employee.id &&
          p.payPeriod.month === month &&
          p.payPeriod.year === year
      );

      if (!payroll) {
        return null;
      }

      const ptAmount = payroll.deductions.find((d) => d.code === 'PT')?.amount || 0;

      return {
        name: `${employee.firstName} ${employee.lastName}`,
        gross: payroll.grossSalary,
        pt: ptAmount,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    return {
      state,
      month,
      year,
      totalEmployees: records.length,
      totalPT: records.reduce((sum, r) => sum + r.pt, 0),
      records,
    };
  }

  // =========================================================================
  // FORM 16 - ANNUAL TDS CERTIFICATE
  // =========================================================================

  /**
   * Generate Form 16 data for an employee
   */
  static generateForm16(
    employee: IndiaEmployee,
    financialYear: string,
    payrollData: PayrollData[],
    employerDetails: {
      name: string;
      tan: string;
      pan: string;
      address: string;
    }
  ): {
    partA: any;
    partB: any;
  } {
    // Filter payroll data for the financial year
    const fyPayroll = payrollData.filter((p) => {
      const fy = this.getFinancialYear(new Date(p.payPeriod.year, p.payPeriod.month - 1, 1));
      return fy === financialYear && p.employeeId === employee.id;
    });

    // Calculate totals
    const totalGross = fyPayroll.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalTDS = fyPayroll.reduce((sum, p) => {
      const tds = p.deductions.find((d) => d.code === 'TDS')?.amount || 0;
      return sum + tds;
    }, 0);

    // Part A - Details of tax deducted and deposited
    const partA = {
      employerName: employerDetails.name,
      employerTAN: employerDetails.tan,
      employerPAN: employerDetails.pan,
      employerAddress: employerDetails.address,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeePAN: employee.pan,
      financialYear,
      assessmentYear: this.getAssessmentYear(financialYear),
      quarterlyDetails: this.getQuarterlyTDSDetails(fyPayroll),
      totalTaxDeducted: totalTDS,
      totalTaxDeposited: totalTDS, // Assuming all deposited
    };

    // Part B - Details of salary and deductions
    const partB = {
      grossSalary: totalGross,
      standardDeduction: 50000,
      netSalaryAfterStandardDeduction: totalGross - 50000,
      deductionsUnderChapterVIA: {
        section80C: employee.declarations?.section80C
          ? Object.values(employee.declarations.section80C).reduce((a, b) => a + (b || 0), 0)
          : 0,
        section80D: employee.declarations?.section80D?.selfAndFamily || 0,
        section80E: employee.declarations?.section80E || 0,
        section80G: employee.declarations?.section80G || 0,
      },
      taxableIncome: 0, // Will be calculated
      taxOnIncome: 0, // Will be calculated
      surcharge: 0,
      cess: 0,
      totalTaxPayable: totalTDS,
      relief: 0,
      netTaxPayable: totalTDS,
    };

    return { partA, partB };
  }

  // =========================================================================
  // SALARY REGISTER
  // =========================================================================

  /**
   * Generate monthly salary register
   */
  static generateSalaryRegister(
    month: number,
    year: number,
    employees: IndiaEmployee[],
    payrollData: PayrollData[]
  ): {
    month: number;
    year: number;
    employees: Array<{
      code: string;
      name: string;
      designation: string;
      department: string;
      basic: number;
      hra: number;
      otherAllowances: number;
      gross: number;
      pf: number;
      esic: number;
      pt: number;
      tds: number;
      otherDeductions: number;
      totalDeductions: number;
      netPay: number;
    }>;
    totals: {
      basic: number;
      hra: number;
      gross: number;
      pf: number;
      esic: number;
      pt: number;
      tds: number;
      netPay: number;
    };
  } {
    const records = employees.map((employee) => {
      const payroll = payrollData.find(
        (p) => p.employeeId === employee.id &&
          p.payPeriod.month === month &&
          p.payPeriod.year === year
      );

      if (!payroll) {
        return null;
      }

      const basic = payroll.earnings.find((e) => e.code === 'BASIC')?.amount || 0;
      const hra = payroll.earnings.find((e) => e.code === 'HRA')?.amount || 0;
      const otherEarnings = payroll.earnings
        .filter((e) => !['BASIC', 'HRA'].includes(e.code))
        .reduce((sum, e) => sum + e.amount, 0);

      const pf = payroll.deductions.find((d) => d.code === 'PF')?.amount || 0;
      const esic = payroll.deductions.find((d) => d.code === 'ESIC')?.amount || 0;
      const pt = payroll.deductions.find((d) => d.code === 'PT')?.amount || 0;
      const tds = payroll.deductions.find((d) => d.code === 'TDS')?.amount || 0;
      const otherDeductions = payroll.deductions
        .filter((d) => !['PF', 'ESIC', 'PT', 'TDS'].includes(d.code))
        .reduce((sum, d) => sum + d.amount, 0);

      return {
        code: employee.employeeCode,
        name: `${employee.firstName} ${employee.lastName}`,
        designation: employee.designation,
        department: employee.department,
        basic,
        hra,
        otherAllowances: otherEarnings,
        gross: payroll.grossSalary,
        pf,
        esic,
        pt,
        tds,
        otherDeductions,
        totalDeductions: payroll.totalDeductions,
        netPay: payroll.netSalary,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    const totals = records.reduce(
      (acc, r) => ({
        basic: acc.basic + r.basic,
        hra: acc.hra + r.hra,
        gross: acc.gross + r.gross,
        pf: acc.pf + r.pf,
        esic: acc.esic + r.esic,
        pt: acc.pt + r.pt,
        tds: acc.tds + r.tds,
        netPay: acc.netPay + r.netPay,
      }),
      { basic: 0, hra: 0, gross: 0, pf: 0, esic: 0, pt: 0, tds: 0, netPay: 0 }
    );

    return {
      month,
      year,
      employees: records,
      totals,
    };
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  /**
   * Get months for a quarter (in FY format)
   */
  private static getQuarterMonths(quarter: 1 | 2 | 3 | 4): number[] {
    const quarters: Record<number, number[]> = {
      1: [1, 2, 3], // Apr, May, Jun
      2: [4, 5, 6], // Jul, Aug, Sep
      3: [7, 8, 9], // Oct, Nov, Dec
      4: [10, 11, 12], // Jan, Feb, Mar
    };
    return quarters[quarter];
  }

  /**
   * Convert calendar month to FY month
   * April = 1, March = 12
   */
  private static getFYMonth(calendarMonth: number): number {
    return calendarMonth >= 4 ? calendarMonth - 3 : calendarMonth + 9;
  }

  /**
   * Get financial year from date
   */
  private static getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  }

  /**
   * Get assessment year from financial year
   */
  private static getAssessmentYear(financialYear: string): string {
    const [startYear] = financialYear.split('-').map(Number);
    const fullStartYear = startYear < 100 ? 2000 + startYear : startYear;
    return `${fullStartYear + 1}-${(fullStartYear + 2).toString().slice(-2)}`;
  }

  /**
   * Get quarterly TDS details
   */
  private static getQuarterlyTDSDetails(
    payrollData: PayrollData[]
  ): Array<{ quarter: number; tdsDeducted: number; tdsDeposited: number; challanNo: string }> {
    const quarterTotals: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

    payrollData.forEach((p) => {
      const fyMonth = this.getFYMonth(p.payPeriod.month);
      const quarter = Math.ceil(fyMonth / 3);
      const tds = p.deductions.find((d) => d.code === 'TDS')?.amount || 0;
      quarterTotals[quarter] += tds;
    });

    return [1, 2, 3, 4].map((q) => ({
      quarter: q,
      tdsDeducted: quarterTotals[q],
      tdsDeposited: quarterTotals[q],
      challanNo: '', // To be filled with actual challan number
    }));
  }

  /**
   * Export ECR to text format for EPFO upload
   */
  static exportECRToText(ecr: IndiaPFECR): string {
    const lines: string[] = [];

    // Header line
    lines.push(`#~#${ecr.establishmentCode}#~#ECR#~#REGULAR#~#${ecr.month.toString().padStart(2, '0')}${ecr.year}`);

    // Employee lines
    ecr.records.forEach((record) => {
      const line = [
        record.uan,
        record.memberName,
        record.grossWages,
        record.epfWages,
        record.epsWages,
        record.edliWages,
        record.epfContribution,
        record.epsContribution,
        record.epfEPSDiff,
        record.ncp,
        '0', // Refund of advances
      ].join('#~#');
      lines.push(line);
    });

    return lines.join('\n');
  }
}
