/**
 * UAE Payroll System - UAE Compliance Module
 * Handles WPS file generation, MOHRE reporting, and regulatory compliance
 */

import { Employee, PayrollItem, PayrollRun, WPSRecord, WPSFile } from '../types';
import { formatDate, roundTo2Decimals } from '../utils';

/**
 * Generate WPS (Wage Protection System) file in SIF format
 * SIF = Standard Import Format used by UAE Central Bank
 */
export function generateWPSFile(
  payrollRun: PayrollRun,
  payrollItems: PayrollItem[],
  employees: Employee[],
  companyInfo: {
    establishmentNumber: string;
    wpsRegistrationNumber: string;
    companyName: string;
  }
): WPSFile {
  // Create WPS records
  const wpsRecords: WPSRecord[] = payrollItems.map((item) => {
    const employee = employees.find((emp) => emp.id === item.employeeId);
    if (!employee) {
      throw new Error(`Employee not found: ${item.employeeId}`);
    }

    return {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      emiratesId: employee.emiratesId,
      laborCardNumber: employee.laborCardNumber,
      basicSalary: item.basicSalary,
      allowances: item.housingAllowance + item.transportationAllowance + item.otherAllowances,
      deductions: item.totalDeductions,
      netSalary: item.netSalary,
      bankName: employee.bankName,
      accountNumber: employee.bankAccountNumber,
      ibanNumber: employee.ibanNumber,
      payrollMonth: payrollRun.payPeriod,
      paymentDate: payrollRun.paymentDate,
    };
  });

  // Generate SIF file content
  const sifContent = generateSIFContent(wpsRecords, companyInfo, payrollRun);

  // Calculate totals
  const totalAmount = wpsRecords.reduce((sum, record) => sum + record.netSalary, 0);

  const wpsFile: WPSFile = {
    id: '',
    fileName: `WPS_${companyInfo.establishmentNumber}_${payrollRun.payPeriod.replace('-', '')}.sif`,
    payrollRunId: payrollRun.id,
    generatedDate: new Date().toISOString(),
    totalEmployees: wpsRecords.length,
    totalAmount: roundTo2Decimals(totalAmount),
    fileContent: sifContent,
    status: 'generated',
    createdAt: new Date().toISOString(),
  };

  return wpsFile;
}

/**
 * Generate SIF file content
 * Format specification from UAE Central Bank
 */
function generateSIFContent(
  records: WPSRecord[],
  companyInfo: {
    establishmentNumber: string;
    wpsRegistrationNumber: string;
    companyName: string;
  },
  payrollRun: PayrollRun
): string {
  const lines: string[] = [];

  // Header Record (SCR)
  const [year, month] = payrollRun.payPeriod.split('-');
  const paymentDate = new Date(payrollRun.paymentDate);
  const formattedDate = `${paymentDate.getDate().toString().padStart(2, '0')}${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}${paymentDate.getFullYear()}`;

  lines.push('SCR'); // Record Type
  lines.push(companyInfo.wpsRegistrationNumber.padEnd(14)); // Establishment WPS ID
  lines.push(companyInfo.companyName.padEnd(100).substring(0, 100)); // Company Name
  lines.push(companyInfo.establishmentNumber.padEnd(20)); // Establishment Number
  lines.push(formattedDate); // Payment Date (DDMMYYYY)
  lines.push(month + year); // Salary Month (MMYYYY)
  lines.push(records.length.toString().padStart(8, '0')); // Number of Records

  const totalSalary = records.reduce((sum, r) => sum + r.netSalary, 0);
  lines.push(Math.round(totalSalary * 100).toString().padStart(15, '0')); // Total Amount (fils)

  const headerRecord = lines.join('|') + '\n';

  // Employee Records (EDR)
  const employeeRecords = records.map((record, index) => {
    const edrLines: string[] = [];

    edrLines.push('EDR'); // Record Type
    edrLines.push((index + 1).toString().padStart(8, '0')); // Sequence Number
    edrLines.push(record.laborCardNumber.padEnd(20)); // Labor Card Number
    edrLines.push(record.employeeName.padEnd(100).substring(0, 100)); // Employee Name
    edrLines.push(record.bankName.padEnd(23)); // Bank Short Name

    // IBAN (remove spaces and ensure proper format)
    const cleanIBAN = record.ibanNumber.replace(/\s/g, '');
    edrLines.push(cleanIBAN.padEnd(23)); // IBAN

    // Salary components (in fils - multiply by 100)
    edrLines.push(Math.round(record.basicSalary * 100).toString().padStart(15, '0')); // Basic Salary
    edrLines.push(Math.round(record.allowances * 100).toString().padStart(15, '0')); // Allowances
    edrLines.push(Math.round(record.deductions * 100).toString().padStart(15, '0')); // Deductions
    edrLines.push(Math.round(record.netSalary * 100).toString().padStart(15, '0')); // Net Salary

    edrLines.push(''); // Days Worked (optional)
    edrLines.push(record.employeeCode.padEnd(20)); // Agent Reference Number
    edrLines.push(''); // Variable Amount (optional)

    return edrLines.join('|');
  }).join('\n');

  return headerRecord + employeeRecords;
}

/**
 * Generate MOHRE (Ministry of Human Resources & Emiratisation) report
 */
export interface MOHREReport {
  reportDate: string;
  companyName: string;
  establishmentNumber: string;
  payrollPeriod: string;
  employees: MOHREEmployeeRecord[];
  summary: {
    totalEmployees: number;
    uaeNationals: number;
    expats: number;
    totalSalary: number;
    averageSalary: number;
  };
}

export interface MOHREEmployeeRecord {
  employeeCode: string;
  employeeName: string;
  emiratesId: string;
  laborCardNumber: string;
  nationality: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  basicSalary: number;
  allowances: number;
  totalSalary: number;
  visaType: string;
  contractType: string;
}

export function generateMOHREReport(
  payrollRun: PayrollRun,
  payrollItems: PayrollItem[],
  employees: Employee[],
  companyInfo: {
    companyName: string;
    establishmentNumber: string;
  }
): MOHREReport {
  const employeeRecords: MOHREEmployeeRecord[] = payrollItems.map((item) => {
    const employee = employees.find((emp) => emp.id === item.employeeId);
    if (!employee) {
      throw new Error(`Employee not found: ${item.employeeId}`);
    }

    return {
      employeeCode: employee.employeeCode,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      emiratesId: employee.emiratesId,
      laborCardNumber: employee.laborCardNumber,
      nationality: employee.nationality,
      designation: employee.designation,
      department: employee.department,
      dateOfJoining: employee.dateOfJoining,
      basicSalary: item.basicSalary,
      allowances: item.housingAllowance + item.transportationAllowance + item.otherAllowances,
      totalSalary: item.grossSalary,
      visaType: employee.visaType,
      contractType: employee.employmentType,
    };
  });

  const uaeNationals = employeeRecords.filter((emp) => emp.nationality.toLowerCase() === 'uae' || emp.nationality.toLowerCase() === 'emirati').length;
  const totalSalary = employeeRecords.reduce((sum, emp) => sum + emp.totalSalary, 0);
  const averageSalary = employeeRecords.length > 0 ? totalSalary / employeeRecords.length : 0;

  return {
    reportDate: new Date().toISOString(),
    companyName: companyInfo.companyName,
    establishmentNumber: companyInfo.establishmentNumber,
    payrollPeriod: payrollRun.payPeriod,
    employees: employeeRecords,
    summary: {
      totalEmployees: employeeRecords.length,
      uaeNationals,
      expats: employeeRecords.length - uaeNationals,
      totalSalary: roundTo2Decimals(totalSalary),
      averageSalary: roundTo2Decimals(averageSalary),
    },
  };
}

/**
 * Export MOHRE report to CSV format
 */
export function exportMOHREReportToCSV(report: MOHREReport): string {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Emirates ID',
    'Labor Card Number',
    'Nationality',
    'Designation',
    'Department',
    'Date of Joining',
    'Basic Salary',
    'Allowances',
    'Total Salary',
    'Visa Type',
    'Contract Type',
  ];

  const rows = report.employees.map((emp) => [
    emp.employeeCode,
    emp.employeeName,
    emp.emiratesId,
    emp.laborCardNumber,
    emp.nationality,
    emp.designation,
    emp.department,
    emp.dateOfJoining,
    emp.basicSalary.toFixed(2),
    emp.allowances.toFixed(2),
    emp.totalSalary.toFixed(2),
    emp.visaType,
    emp.contractType,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Validate WPS compliance
 */
export function validateWPSCompliance(employee: Employee): {
  isCompliant: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Emirates ID
  if (!employee.emiratesId || employee.emiratesId.trim() === '') {
    errors.push('Emirates ID is required');
  }

  // Check Labor Card
  if (!employee.laborCardNumber || employee.laborCardNumber.trim() === '') {
    errors.push('Labor Card Number is required');
  }

  // Check Bank Details
  if (!employee.bankName || employee.bankName.trim() === '') {
    errors.push('Bank Name is required');
  }

  if (!employee.ibanNumber || employee.ibanNumber.trim() === '') {
    errors.push('IBAN is required');
  } else {
    // Validate IBAN format
    const cleanIBAN = employee.ibanNumber.replace(/\s/g, '');
    if (!/^AE\d{21}$/.test(cleanIBAN)) {
      errors.push('IBAN format is invalid (must be AE + 21 digits)');
    }
  }

  // Check minimum wage compliance (UAE minimum wage is AED 1,000 for unlimited contract)
  if (employee.employmentType === 'unlimited' && employee.basicSalary < 1000) {
    warnings.push('Basic salary is below UAE minimum wage for unlimited contracts');
  }

  // Check document expiry
  const today = new Date();
  const visaExpiry = new Date(employee.visaExpiry);
  const laborCardExpiry = new Date(employee.laborCardExpiry);

  if (visaExpiry <= today) {
    errors.push('Visa has expired');
  } else if ((visaExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30) {
    warnings.push('Visa expires within 30 days');
  }

  if (laborCardExpiry <= today) {
    errors.push('Labor Card has expired');
  } else if ((laborCardExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30) {
    warnings.push('Labor Card expires within 30 days');
  }

  return {
    isCompliant: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Emiratisation percentage
 * UAE requires certain percentages of UAE nationals in private sector
 */
export function calculateEmiratisation(employees: Employee[]): {
  totalEmployees: number;
  uaeNationals: number;
  expats: number;
  emiratisationPercentage: number;
  isCompliant: boolean;
  requiredPercentage: number;
} {
  const totalEmployees = employees.filter((emp) => emp.isActive).length;
  const uaeNationals = employees.filter(
    (emp) =>
      emp.isActive &&
      (emp.nationality.toLowerCase() === 'uae' ||
        emp.nationality.toLowerCase() === 'emirati' ||
        emp.nationality.toLowerCase() === 'united arab emirates')
  ).length;

  const expats = totalEmployees - uaeNationals;
  const emiratisationPercentage = totalEmployees > 0 ? (uaeNationals / totalEmployees) * 100 : 0;

  // Emiratisation requirements vary by company size and sector
  // For companies with 50+ employees, 2% UAE nationals required (as of 2023)
  const requiredPercentage = totalEmployees >= 50 ? 2 : 0;
  const isCompliant = emiratisationPercentage >= requiredPercentage;

  return {
    totalEmployees,
    uaeNationals,
    expats,
    emiratisationPercentage: roundTo2Decimals(emiratisationPercentage),
    isCompliant,
    requiredPercentage,
  };
}

/**
 * Generate bank transfer file (for direct salary transfer)
 */
export function generateBankTransferFile(
  payrollItems: PayrollItem[],
  employees: Employee[],
  companyInfo: {
    companyName: string;
    bankName: string;
    accountNumber: string;
  }
): string {
  const lines: string[] = [];

  // Header
  lines.push('Bank Transfer File');
  lines.push(`Company: ${companyInfo.companyName}`);
  lines.push(`Date: ${formatDate(new Date())}`);
  lines.push(`Total Transactions: ${payrollItems.length}`);
  lines.push('');

  // Column headers
  lines.push(
    [
      'Employee Code',
      'Employee Name',
      'Bank Name',
      'Account Number',
      'IBAN',
      'Amount',
    ]
      .map((h) => h.padEnd(20))
      .join(' | ')
  );
  lines.push('-'.repeat(140));

  // Transaction details
  payrollItems.forEach((item) => {
    const employee = employees.find((emp) => emp.id === item.employeeId);
    if (employee) {
      lines.push(
        [
          employee.employeeCode.padEnd(20),
          `${employee.firstName} ${employee.lastName}`.padEnd(20).substring(0, 20),
          employee.bankName.padEnd(20).substring(0, 20),
          employee.bankAccountNumber.padEnd(20),
          employee.ibanNumber.padEnd(20),
          `AED ${item.netSalary.toFixed(2)}`.padEnd(20),
        ].join(' | ')
      );
    }
  });

  // Footer with total
  lines.push('-'.repeat(140));
  const totalAmount = payrollItems.reduce((sum, item) => sum + item.netSalary, 0);
  lines.push(`Total Amount: AED ${totalAmount.toFixed(2)}`);

  return lines.join('\n');
}

/**
 * Download file helper
 */
export function downloadFile(content: string, fileName: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
