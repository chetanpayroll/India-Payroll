/**
 * UAE Payroll System - Payroll Calculation Engine
 * Handles all payroll calculations according to UAE Labor Law
 */

import {
  Employee,
  PayrollItem,
  PayrollEarning,
  PayrollDeduction,
  GratuityCalculation,
} from '../types';
import {
  roundTo2Decimals,
  calculateWorkingDays,
  getDaysInMonth,
  calculateYearsOfService,
} from '../utils';
import { loanService, salaryAdvanceService } from './data-service';

/**
 * Calculate payroll for a single employee
 */
export function calculateEmployeePayroll(
  employee: Employee,
  year: number,
  month: number,
  params: {
    presentDays?: number;
    absentDays?: number;
    leaveDays?: number;
    regularOTHours?: number;
    weekendOTHours?: number;
    holidayOTHours?: number;
    bonus?: number;
    commission?: number;
    reimbursements?: number;
    otherDeductions?: number;
  } = {}
): PayrollItem {
  const daysInMonth = getDaysInMonth(year, month);
  const workingDaysInMonth = calculateWorkingDaysInMonth(year, month);

  // Working days
  const presentDays = params.presentDays ?? workingDaysInMonth;
  const absentDays = params.absentDays ?? 0;
  const leaveDays = params.leaveDays ?? 0;
  const actualWorkingDays = presentDays - absentDays;

  // Calculate earnings
  const basicSalary = calculateProRatedSalary(employee.basicSalary, workingDaysInMonth, presentDays);
  const housingAllowance = calculateProRatedSalary(employee.housingAllowance, workingDaysInMonth, presentDays);
  const transportationAllowance = calculateProRatedSalary(employee.transportationAllowance, workingDaysInMonth, presentDays);

  // Other allowances
  let otherAllowances = 0;
  employee.otherAllowances.forEach((allowance) => {
    otherAllowances += calculateProRatedSalary(allowance.amount, workingDaysInMonth, presentDays);
  });

  // Overtime calculations
  const hourlyRate = calculateHourlyRate(employee.basicSalary);
  const regularOTAmount = (params.regularOTHours ?? 0) * hourlyRate * 1.25;
  const weekendOTAmount = (params.weekendOTHours ?? 0) * hourlyRate * 1.5;
  const holidayOTAmount = (params.holidayOTHours ?? 0) * hourlyRate * 1.5;
  const totalOvertimeAmount = roundTo2Decimals(regularOTAmount + weekendOTAmount + holidayOTAmount);

  // Additional payments
  const bonus = params.bonus ?? 0;
  const commission = params.commission ?? 0;
  const reimbursements = params.reimbursements ?? 0;

  // Total earnings
  const totalEarnings = roundTo2Decimals(
    basicSalary +
    housingAllowance +
    transportationAllowance +
    otherAllowances +
    totalOvertimeAmount +
    bonus +
    commission +
    reimbursements
  );

  // Calculate deductions
  const absenceDeduction = calculateAbsenceDeduction(
    employee.basicSalary,
    employee.housingAllowance,
    employee.transportationAllowance,
    workingDaysInMonth,
    absentDays
  );

  // Loan deductions
  const loanDeduction = calculateLoanDeduction(employee.id, `${year}-${String(month).padStart(2, '0')}`);

  // Salary advance deductions
  const advanceDeduction = calculateAdvanceDeduction(employee.id, `${year}-${String(month).padStart(2, '0')}`);

  // Other deductions
  const otherDeductions = params.otherDeductions ?? 0;

  // Total deductions
  const totalDeductions = roundTo2Decimals(
    absenceDeduction + loanDeduction + advanceDeduction + otherDeductions
  );

  // Net salary
  const grossSalary = totalEarnings;
  const netSalary = roundTo2Decimals(grossSalary - totalDeductions);

  // Build earnings breakdown
  const earnings: PayrollEarning[] = [];

  if (basicSalary > 0) {
    earnings.push({
      id: 'basic',
      name: 'Basic Salary',
      amount: basicSalary,
      type: 'basic',
    });
  }

  if (housingAllowance > 0) {
    earnings.push({
      id: 'housing',
      name: 'Housing Allowance',
      amount: housingAllowance,
      type: 'allowance',
    });
  }

  if (transportationAllowance > 0) {
    earnings.push({
      id: 'transport',
      name: 'Transportation Allowance',
      amount: transportationAllowance,
      type: 'allowance',
    });
  }

  employee.otherAllowances.forEach((allowance) => {
    const prorated = calculateProRatedSalary(allowance.amount, workingDaysInMonth, presentDays);
    if (prorated > 0) {
      earnings.push({
        id: allowance.id,
        name: allowance.name,
        amount: prorated,
        type: 'allowance',
      });
    }
  });

  if (totalOvertimeAmount > 0) {
    earnings.push({
      id: 'overtime',
      name: 'Overtime',
      amount: totalOvertimeAmount,
      type: 'overtime',
    });
  }

  if (bonus > 0) {
    earnings.push({
      id: 'bonus',
      name: 'Bonus',
      amount: bonus,
      type: 'bonus',
    });
  }

  if (commission > 0) {
    earnings.push({
      id: 'commission',
      name: 'Commission',
      amount: commission,
      type: 'commission',
    });
  }

  if (reimbursements > 0) {
    earnings.push({
      id: 'reimbursement',
      name: 'Reimbursements',
      amount: reimbursements,
      type: 'reimbursement',
    });
  }

  // Build deductions breakdown
  const deductions: PayrollDeduction[] = [];

  if (absenceDeduction > 0) {
    deductions.push({
      id: 'absence',
      name: 'Absence Deduction',
      amount: absenceDeduction,
      type: 'absence',
    });
  }

  if (loanDeduction > 0) {
    deductions.push({
      id: 'loan',
      name: 'Loan Deduction',
      amount: loanDeduction,
      type: 'loan',
    });
  }

  if (advanceDeduction > 0) {
    deductions.push({
      id: 'advance',
      name: 'Salary Advance',
      amount: advanceDeduction,
      type: 'advance',
    });
  }

  if (otherDeductions > 0) {
    deductions.push({
      id: 'other',
      name: 'Other Deductions',
      amount: otherDeductions,
      type: 'other',
    });
  }

  // Create payroll item
  const payrollItem: PayrollItem = {
    id: '',
    payrollRunId: '',
    employeeId: employee.id,
    employee,

    workingDays: workingDaysInMonth,
    presentDays,
    absentDays,
    leaveDays,
    weekendDays: daysInMonth - workingDaysInMonth,
    publicHolidays: 0,

    basicSalary,
    housingAllowance,
    transportationAllowance,
    otherAllowances,
    overtime: totalOvertimeAmount,
    bonus,
    commission,
    reimbursements,
    totalEarnings,

    absenceDeduction,
    loanDeduction,
    advanceDeduction,
    otherDeductions,
    totalDeductions,

    grossSalary,
    netSalary,

    regularOTHours: params.regularOTHours ?? 0,
    weekendOTHours: params.weekendOTHours ?? 0,
    holidayOTHours: params.holidayOTHours ?? 0,

    earnings,
    deductions,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return payrollItem;
}

/**
 * Calculate pro-rated salary based on working days
 */
function calculateProRatedSalary(
  monthlySalary: number,
  totalWorkingDays: number,
  actualDays: number
): number {
  if (totalWorkingDays === 0) return 0;
  const perDayRate = monthlySalary / totalWorkingDays;
  return roundTo2Decimals(perDayRate * actualDays);
}

/**
 * Calculate hourly rate from monthly salary
 * UAE: Monthly salary / 30 days / 8 hours
 */
function calculateHourlyRate(monthlySalary: number): number {
  return roundTo2Decimals(monthlySalary / 30 / 8);
}

/**
 * Calculate working days in a month (excluding Friday & Saturday)
 */
function calculateWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = getDaysInMonth(year, month);
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Exclude Friday (5) and Saturday (6)
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
}

/**
 * Calculate absence deduction
 */
function calculateAbsenceDeduction(
  basicSalary: number,
  housingAllowance: number,
  transportAllowance: number,
  workingDaysInMonth: number,
  absentDays: number
): number {
  if (absentDays === 0) return 0;

  const totalMonthlyPay = basicSalary + housingAllowance + transportAllowance;
  const perDayRate = totalMonthlyPay / workingDaysInMonth;
  return roundTo2Decimals(perDayRate * absentDays);
}

/**
 * Calculate loan deduction for the month
 */
function calculateLoanDeduction(employeeId: string, payPeriod: string): number {
  const activeLoans = loanService.getActiveLoans(employeeId);
  let totalDeduction = 0;

  activeLoans.forEach((loan) => {
    if (loan.status === 'active' && loan.remainingAmount > 0) {
      totalDeduction += loan.installmentAmount;
    }
  });

  return roundTo2Decimals(totalDeduction);
}

/**
 * Calculate salary advance deduction for the month
 */
function calculateAdvanceDeduction(employeeId: string, payPeriod: string): number {
  const advances = salaryAdvanceService.getByEmployee(employeeId);
  let totalDeduction = 0;

  advances.forEach((advance) => {
    if (advance.approvalStatus === 'approved' && advance.deductionMonth === payPeriod) {
      totalDeduction += advance.advanceAmount;
    }
  });

  return roundTo2Decimals(totalDeduction);
}

/**
 * Calculate gratuity according to UAE Labor Law
 * - First 5 years: 21 days of basic salary per year
 * - After 5 years: 30 days of basic salary per year
 * - Pro-rata for partial years
 */
export function calculateGratuity(
  employee: Employee,
  leavingDate: Date | string = new Date()
): GratuityCalculation {
  const joiningDate = new Date(employee.dateOfJoining);
  const endDate = typeof leavingDate === 'string' ? new Date(leavingDate) : leavingDate;

  const service = calculateYearsOfService(employee.dateOfJoining);
  const totalYears = service.totalYears;

  // Calculate gratuity for first 5 years (21 days per year)
  const yearsUnder5 = Math.min(totalYears, 5);
  const gratuityFirst5 = (employee.basicSalary / 30) * 21 * yearsUnder5;

  // Calculate gratuity after 5 years (30 days per year)
  const yearsAbove5 = Math.max(0, totalYears - 5);
  const gratuityAfter5 = (employee.basicSalary / 30) * 30 * yearsAbove5;

  const totalGratuity = roundTo2Decimals(gratuityFirst5 + gratuityAfter5);

  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    dateOfJoining: employee.dateOfJoining,
    dateOfLeaving: endDate.toISOString(),
    totalServiceYears: service.years,
    totalServiceMonths: service.months,
    totalServiceDays: service.days,
    basicSalary: employee.basicSalary,
    yearsUnder5: roundTo2Decimals(yearsUnder5),
    yearsAbove5: roundTo2Decimals(yearsAbove5),
    gratuityForFirst5Years: roundTo2Decimals(gratuityFirst5),
    gratuityAfter5Years: roundTo2Decimals(gratuityAfter5),
    totalGratuity,
    isCompliant: true,
    notes: `Calculated as per UAE Labor Law: ${yearsUnder5.toFixed(2)} years @ 21 days + ${yearsAbove5.toFixed(2)} years @ 30 days`,
  };
}

/**
 * Calculate leave salary (for encashment)
 * UAE: Basic salary / 30 * number of leave days
 */
export function calculateLeaveSalary(basicSalary: number, leaveDays: number): number {
  const perDayRate = basicSalary / 30;
  return roundTo2Decimals(perDayRate * leaveDays);
}

/**
 * Calculate end of service benefits
 * Includes gratuity + leave encashment
 */
export function calculateEndOfServiceBenefits(
  employee: Employee,
  leavingDate: Date | string = new Date(),
  unusedLeaveDays: number = 0
): {
  gratuity: number;
  leaveEncashment: number;
  totalBenefit: number;
  breakdown: GratuityCalculation;
} {
  const gratuityCalc = calculateGratuity(employee, leavingDate);
  const leaveEncashment = calculateLeaveSalary(employee.basicSalary, unusedLeaveDays);
  const totalBenefit = roundTo2Decimals(gratuityCalc.totalGratuity + leaveEncashment);

  return {
    gratuity: gratuityCalc.totalGratuity,
    leaveEncashment,
    totalBenefit,
    breakdown: gratuityCalc,
  };
}

/**
 * Calculate YTD (Year to Date) totals
 */
export function calculateYTD(payrollItems: PayrollItem[]): {
  ytdGross: number;
  ytdNet: number;
  ytdDeductions: number;
} {
  let ytdGross = 0;
  let ytdNet = 0;
  let ytdDeductions = 0;

  payrollItems.forEach((item) => {
    ytdGross += item.grossSalary;
    ytdNet += item.netSalary;
    ytdDeductions += item.totalDeductions;
  });

  return {
    ytdGross: roundTo2Decimals(ytdGross),
    ytdNet: roundTo2Decimals(ytdNet),
    ytdDeductions: roundTo2Decimals(ytdDeductions),
  };
}

/**
 * Validate payroll item calculations
 */
export function validatePayrollItem(item: PayrollItem): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if gross salary matches total earnings
  const calculatedGross = roundTo2Decimals(item.totalEarnings);
  if (Math.abs(item.grossSalary - calculatedGross) > 0.01) {
    errors.push(`Gross salary mismatch: ${item.grossSalary} vs ${calculatedGross}`);
  }

  // Check if net salary is correct
  const calculatedNet = roundTo2Decimals(item.grossSalary - item.totalDeductions);
  if (Math.abs(item.netSalary - calculatedNet) > 0.01) {
    errors.push(`Net salary mismatch: ${item.netSalary} vs ${calculatedNet}`);
  }

  // Check for negative values
  if (item.netSalary < 0) {
    errors.push('Net salary cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
