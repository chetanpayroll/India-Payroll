/**
 * UAE Payroll System - Comprehensive Type Definitions
 * Production-ready types for all modules
 */

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export type EmploymentType = 'limited' | 'unlimited';
export type VisaType = 'employment' | 'investor' | 'partner' | 'dependent' | 'golden';
export type EmploymentStatus = 'active' | 'probation' | 'notice_period' | 'terminated' | 'resigned';
export type Gender = 'male' | 'female';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Employee {
  id: string;
  employeeCode: string;

  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  fullNameArabic?: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  nationality: string;
  religion?: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  address: string;
  city: string;
  emirate: string;

  // UAE-Specific Documents
  emiratesId: string;
  emiratesIdExpiry: string;
  passportNumber: string;
  passportExpiry: string;
  visaNumber: string;
  visaType: VisaType;
  visaExpiry: string;
  laborCardNumber: string;
  laborCardExpiry: string;

  // Employment Details
  department: string;
  designation: string;
  costCenter?: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfJoining: string;
  probationEndDate?: string;
  confirmationDate?: string;
  contractStartDate: string;
  contractEndDate?: string;

  // Bank Details
  bankName: string;
  bankAccountNumber: string;
  ibanNumber: string;
  bankBranch?: string;

  // Salary Information
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: SalaryAllowance[];

  // Leave Balances
  annualLeaveBalance: number;
  sickLeaveBalance: number;

  // Manager and Reporting
  managerId?: string;

  // System Fields
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SalaryAllowance {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
  isTaxable: boolean;
  isWPSIncluded: boolean;
}

// ============================================================================
// PAYROLL TYPES
// ============================================================================

export type PayrollStatus = 'draft' | 'calculated' | 'approved' | 'finalized' | 'paid';

export interface PayrollRun {
  id: string;
  runCode: string;
  payPeriod: string; // YYYY-MM
  payrollMonth: number; // 1-12
  payrollYear: number;
  paymentDate: string;
  status: PayrollStatus;

  // Totals
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number;

  // Processing Info
  processedBy?: string;
  approvedBy?: string;
  finalizedBy?: string;
  processedAt?: string;
  approvedAt?: string;
  finalizedAt?: string;

  // System Fields
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employee?: Employee;

  // Working Days
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  weekendDays: number;
  publicHolidays: number;

  // Earnings
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  overtime: number;
  bonus: number;
  commission: number;
  reimbursements: number;
  totalEarnings: number;

  // Deductions
  absenceDeduction: number;
  loanDeduction: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net Calculations
  grossSalary: number;
  netSalary: number;

  // Overtime Details
  regularOTHours: number; // 1.25x
  weekendOTHours: number; // 1.5x
  holidayOTHours: number; // 1.5x

  // Breakdown
  earnings: PayrollEarning[];
  deductions: PayrollDeduction[];

  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface PayrollEarning {
  id: string;
  name: string;
  amount: number;
  type: 'basic' | 'allowance' | 'overtime' | 'bonus' | 'commission' | 'reimbursement' | 'other';
}

export interface PayrollDeduction {
  id: string;
  name: string;
  amount: number;
  type: 'absence' | 'loan' | 'advance' | 'other';
}

// ============================================================================
// LEAVE TYPES
// ============================================================================

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;

  // Approvals
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;

  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  annualLeaveEntitled: number;
  annualLeaveTaken: number;
  annualLeaveBalance: number;
  sickLeaveTaken: number;
  sickLeaveBalance: number;
  unpaidLeaveTaken: number;
  year: number;
}

// ============================================================================
// LOAN & ADVANCE TYPES
// ============================================================================

export type LoanStatus = 'active' | 'paid' | 'cancelled';
export type AdvanceStatus = 'pending' | 'approved' | 'rejected' | 'deducted';

export interface Loan {
  id: string;
  employeeId: string;
  employee?: Employee;
  loanAmount: number;
  loanDate: string;
  numberOfInstallments: number;
  installmentAmount: number;
  paidInstallments: number;
  remainingAmount: number;
  status: LoanStatus;
  reason: string;

  // Approvals
  approvedBy?: string;
  approvedDate?: string;

  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employee?: Employee;
  advanceAmount: number;
  requestDate: string;
  approvalStatus: AdvanceStatus;
  deductionMonth?: string;
  reason: string;

  // Approvals
  approvedBy?: string;
  approvedDate?: string;
  deductedDate?: string;

  // System Fields
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// UAE COMPLIANCE TYPES
// ============================================================================

export interface GratuityCalculation {
  employeeId: string;
  employeeName: string;
  dateOfJoining: string;
  dateOfLeaving: string;
  totalServiceYears: number;
  totalServiceMonths: number;
  totalServiceDays: number;

  basicSalary: number;

  // Calculation Breakdown
  yearsUnder5: number;
  yearsAbove5: number;

  gratuityForFirst5Years: number;
  gratuityAfter5Years: number;

  totalGratuity: number;

  // UAE Labor Law compliance
  isCompliant: boolean;
  notes: string;
}

export interface WPSRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  emiratesId: string;
  laborCardNumber: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  bankName: string;
  accountNumber: string;
  ibanNumber: string;
  payrollMonth: string;
  paymentDate: string;
}

export interface WPSFile {
  id: string;
  fileName: string;
  payrollRunId: string;
  generatedDate: string;
  totalEmployees: number;
  totalAmount: number;
  fileContent: string; // SIF format content
  status: 'generated' | 'submitted' | 'processed';
  createdAt: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface PayrollSummary {
  month: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number;
  departments: DepartmentCost[];
}

export interface DepartmentCost {
  department: string;
  employeeCount: number;
  totalCost: number;
  averageCost: number;
}

export interface EmployeeCostBreakdown {
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  totalEarnings: number;
  deductions: number;
  netSalary: number;
  employerCosts: number;
}

// ============================================================================
// PAYSLIP TYPES
// ============================================================================

export interface Payslip {
  id: string;
  payrollItemId: string;
  employeeId: string;
  payPeriod: string;

  // Employee Info
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;

  // Earnings
  earnings: PayslipLine[];
  totalEarnings: number;

  // Deductions
  deductions: PayslipLine[];
  totalDeductions: number;

  // Net
  grossSalary: number;
  netSalary: number;

  // YTD
  ytdGross: number;
  ytdNet: number;

  // System Fields
  generatedDate: string;
  paymentDate: string;
}

export interface PayslipLine {
  description: string;
  amount: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface CompanySettings {
  id: string;
  companyName: string;
  companyNameArabic?: string;
  tradeLicenseNumber: string;
  establishmentNumber: string;
  wpsRegistrationNumber: string;
  mohreCompanyId: string;

  // Contact
  address: string;
  city: string;
  emirate: string;
  poBox: string;
  phone: string;
  email: string;
  website?: string;

  // Logo
  logoUrl?: string;

  // Payroll Settings
  payrollDayOfMonth: number;
  weekendDays: number[]; // 0-6 (Sunday-Saturday)
  publicHolidays: PublicHoliday[];

  // Leave Settings
  annualLeavePerYear: number; // Default 30 days in UAE
  sickLeaveFullPay: number; // Default 90 days
  maternityLeaveDays: number; // Default 60 days
  paternityLeaveDays: number; // Default 5 days

  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  nameArabic?: string;
  date: string;
  isRecurring: boolean;
  year?: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onProbation: number;
  onNotice: number;

  currentMonthPayroll: number;
  lastMonthPayroll: number;
  payrollChange: number;

  pendingLeaves: number;
  pendingApprovals: number;

  expiringDocuments: ExpiringDocument[];

  recentPayrolls: PayrollRun[];

  departmentBreakdown: {
    department: string;
    count: number;
    percentage: number;
  }[];
}

export interface ExpiringDocument {
  employeeId: string;
  employeeName: string;
  documentType: 'visa' | 'emirates_id' | 'passport' | 'labor_card';
  expiryDate: string;
  daysUntilExpiry: number;
  isExpired: boolean;
  isUrgent: boolean; // Less than 30 days
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  department?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
