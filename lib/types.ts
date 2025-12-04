/**
 * UAE Payroll System - Comprehensive Type Definitions
 * Production-ready types for all modules
 */

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export type EmploymentType = 'permanent' | 'contract' | 'intern';
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
  state: string;

  // India-Specific Documents
  pan: string;
  aadhaar: string;
  uan?: string;
  esicNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;

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
  ifscCode: string;
  bankBranch?: string;

  // Salary Information
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  medicalAllowance: number;
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
  pfRegistrationNumber?: string;
  esicRegistrationNumber?: string;
  panNumber?: string;
  gstin?: string;

  // Contact
  address: string;
  city: string;
  state: string;
  pinCode: string;
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

// ============================================================================
// ENTERPRISE: MULTI-ENTITY & ORGANIZATIONAL HIERARCHY
// ============================================================================

export interface CompanyGroup {
  id: string;
  groupName: string;
  groupCode: string;
  description?: string;
  headOfficeAddress: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  currency: string;
  fiscalYearStart: string; // MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  groupId: string;
  entityName: string;
  entityCode: string;
  entityType: 'headquarters' | 'branch' | 'subsidiary' | 'division' | 'department';
  tradeLicenseNumber: string;
  establishmentNumber: string;
  wpsRegistrationNumber: string;
  mohreCompanyId: string;

  // Location
  address: string;
  city: string;
  emirate: string;
  poBox: string;
  phone: string;
  email: string;

  // Hierarchy
  parentEntityId?: string;
  level: number; // 0 = top level, 1 = subsidiary, etc.

  // Settings
  currency: string;
  timeZone: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  entityId: string;
  costCenterCode: string;
  costCenterName: string;
  description?: string;
  managerId?: string;
  budgetAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  entityId: string;
  departmentCode: string;
  departmentName: string;
  description?: string;
  costCenterId?: string;
  managerId?: string;
  parentDepartmentId?: string;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  entityId: string;
  locationCode: string;
  locationName: string;
  address: string;
  city: string;
  emirate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: ADVANCED PAYROLL FEATURES
// ============================================================================

export interface Currency {
  code: string; // AED, USD, EUR, etc.
  symbol: string;
  exchangeRate: number; // Rate to base currency
  isBaseCurrency: boolean;
}

export interface SalaryRevision {
  id: string;
  employeeId: string;
  effectiveDate: string;
  previousBasicSalary: number;
  newBasicSalary: number;
  previousGross: number;
  newGross: number;
  revisionPercentage: number;
  revisionAmount: number;
  revisionType: 'promotion' | 'annual_increment' | 'performance' | 'market_adjustment' | 'other';
  reason: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bonus {
  id: string;
  bonusCode: string;
  bonusName: string;
  bonusType: 'performance' | 'annual' | 'project' | 'sales' | 'retention' | 'signing' | 'festive' | 'other';
  calculationType: 'fixed_amount' | 'percentage_of_basic' | 'percentage_of_gross' | 'custom';
  value: number; // Amount or percentage
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  eligibilityCriteria?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeBonus {
  id: string;
  employeeId: string;
  bonusId: string;
  bonus?: Bonus;
  payPeriod: string;
  bonusAmount: number;
  payrollRunId?: string;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  employeeId: string;
  payPeriod: string;
  salesAmount: number;
  commissionRate: number;
  commissionAmount: number;
  payrollRunId?: string;
  status: 'pending' | 'approved' | 'paid';
  description: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollBatch {
  id: string;
  batchName: string;
  entityId: string;
  departmentIds?: string[];
  employeeIds?: string[];
  payPeriod: string;
  status: 'draft' | 'processing' | 'completed' | 'approved' | 'paid';
  totalEmployees: number;
  processedEmployees: number;
  failedEmployees: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: HR MANAGEMENT
// ============================================================================

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string; // YYYY-Q1, YYYY-H1, YYYY
  reviewType: 'probation' | 'quarterly' | 'semi_annual' | 'annual' | 'project';
  reviewDate: string;

  // Ratings
  overallRating: number; // 1-5
  technicalSkills: number;
  softSkills: number;
  productivity: number;
  teamwork: number;
  leadership: number;

  // Details
  achievements: string;
  areasOfImprovement: string;
  goals: PerformanceGoal[];

  // Outcomes
  recommendedAction: 'promote' | 'increment' | 'bonus' | 'training' | 'pip' | 'none';
  reviewerComments: string;
  employeeComments?: string;

  status: 'draft' | 'submitted' | 'acknowledged' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceGoal {
  id: string;
  description: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  completionPercentage: number;
}

export interface JobRequisition {
  id: string;
  requisitionCode: string;
  entityId: string;
  departmentId: string;
  position: string;
  numberOfPositions: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary';
  jobDescription: string;
  qualifications: string;
  experienceRequired: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  requestedBy: string;
  requestDate: string;
  requiredByDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'pending_approval' | 'approved' | 'open' | 'closed' | 'cancelled';
  approvedBy?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  requisitionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  currentLocation: string;
  noticePeriod: number; // days
  expectedSalary: number;

  // Resume
  resumeUrl?: string;
  linkedInUrl?: string;

  // Screening
  appliedDate: string;
  source: 'career_site' | 'referral' | 'linkedin' | 'job_portal' | 'agency' | 'other';
  referredBy?: string;

  // Status
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  currentStage: string;

  // Interviews
  interviews: Interview[];

  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  interviewType: 'phone_screening' | 'technical' | 'hr' | 'manager' | 'panel' | 'final';
  scheduledDate: string;
  interviewerIds: string[];
  duration: number; // minutes
  location: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  rating?: number; // 1-5
  recommendation: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgram {
  id: string;
  programCode: string;
  programName: string;
  programType: 'technical' | 'soft_skills' | 'leadership' | 'compliance' | 'safety' | 'other';
  description: string;
  duration: number; // hours
  provider: string;
  cost: number;
  currency: string;
  maxParticipants: number;
  location: string;
  isOnline: boolean;
  startDate: string;
  endDate: string;
  status: 'planned' | 'open' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  programId: string;
  employeeId: string;
  enrollmentDate: string;
  completionDate?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  score?: number;
  certificateUrl?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingChecklist {
  id: string;
  employeeId: string;
  tasks: OnboardingTask[];
  status: 'not_started' | 'in_progress' | 'completed';
  assignedTo: string;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingTask {
  id: string;
  taskName: string;
  description: string;
  category: 'documentation' | 'it_setup' | 'orientation' | 'training' | 'admin' | 'other';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: string;
  completedBy?: string;
  notes?: string;
}

// ============================================================================
// ENTERPRISE: TIME & ATTENDANCE
// ============================================================================

export interface Shift {
  id: string;
  shiftCode: string;
  shiftName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDuration: number; // minutes
  workingHours: number;
  isNightShift: boolean;
  nightShiftAllowance?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  shiftId: string;
  shift?: Shift;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftRoster {
  id: string;
  entityId: string;
  departmentId?: string;
  rosterName: string;
  rosterPeriod: string; // YYYY-MM
  status: 'draft' | 'published' | 'locked';
  shifts: RosterAssignment[];
  createdBy: string;
  publishedBy?: string;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RosterAssignment {
  id: string;
  rosterId: string;
  employeeId: string;
  date: string;
  shiftId: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  shiftId?: string;

  // Timing
  checkInTime?: string;
  checkOutTime?: string;
  workingHours: number;

  // Status
  status: 'present' | 'absent' | 'leave' | 'weekend' | 'holiday' | 'half_day';
  attendanceType: 'regular' | 'late' | 'early_out' | 'overtime';

  // Late/Early
  lateBy?: number; // minutes
  earlyOutBy?: number; // minutes

  // Overtime
  overtimeHours?: number;
  overtimeApproved: boolean;

  // Location
  checkInLocation?: string;
  checkOutLocation?: string;

  // Approval
  approvedBy?: string;
  approvedDate?: string;

  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  requestDate: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: ADVANCED LEAVE MANAGEMENT
// ============================================================================

export interface LeavePolicy {
  id: string;
  policyName: string;
  leaveType: LeaveType;
  entityId?: string;

  // Entitlement
  annualEntitlement: number; // days per year
  accrualType: 'annual' | 'monthly' | 'none';
  monthlyAccrual?: number;

  // Rules
  minDaysPerRequest: number;
  maxDaysPerRequest: number;
  maxConsecutiveDays: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays?: number;
  encashmentAllowed: boolean;
  maxEncashmentDays?: number;

  // Approval
  requiresApproval: boolean;
  approvalLevels: number;
  advanceNoticeDays: number;

  // Documentation
  requiresDocument: boolean;
  documentType?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveApprovalFlow {
  id: string;
  leaveRequestId: string;
  level: number;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  actionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveEncashment {
  id: string;
  employeeId: string;
  year: number;
  daysEncashed: number;
  amountPerDay: number;
  totalAmount: number;
  payrollRunId?: string;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCalendar {
  date: string;
  employees: {
    employeeId: string;
    employeeName: string;
    leaveType: LeaveType;
  }[];
}

// ============================================================================
// ENTERPRISE: ADVANCED LOAN & ADVANCE
// ============================================================================

export interface LoanType {
  id: string;
  loanTypeName: string;
  maxAmount: number;
  maxInstallments: number;
  interestRate: number; // percentage
  requiresGuarantor: boolean;
  eligibilityCriteria: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  payrollRunId?: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: WORKFLOWS & APPROVALS
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  workflowName: string;
  workflowType: 'leave' | 'loan' | 'advance' | 'expense' | 'requisition' | 'overtime' | 'custom';
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  stepNumber: number;
  stepName: string;
  approverType: 'direct_manager' | 'department_head' | 'hr' | 'finance' | 'ceo' | 'specific_user';
  approverId?: string;
  isRequired: boolean;
  timeoutDays?: number;
}

export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  entityType: string; // 'leave_request', 'loan', etc.
  entityId: string;
  requestedBy: string;
  requestedDate: string;
  currentStep: number;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  approvalHistory: ApprovalHistory[];
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalHistory {
  stepNumber: number;
  approverId: string;
  approverName: string;
  action: 'approved' | 'rejected' | 'delegated' | 'cancelled';
  comments?: string;
  actionDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'approval' | 'document_expiry' | 'payroll' | 'leave' | 'system' | 'other';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// ============================================================================
// ENTERPRISE: DOCUMENT MANAGEMENT
// ============================================================================

export interface DocumentCategory {
  id: string;
  categoryName: string;
  description?: string;
  requiresExpiry: boolean;
  expiryReminderDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  categoryId: string;
  category?: DocumentCategory;
  documentName: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  documentUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedDate: string;
  status: 'active' | 'expired' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: ANALYTICS & REPORTING
// ============================================================================

export interface KPI {
  id: string;
  kpiName: string;
  kpiType: 'headcount' | 'cost' | 'turnover' | 'productivity' | 'compliance' | 'custom';
  currentValue: number;
  targetValue: number;
  unit: 'count' | 'percentage' | 'currency' | 'days';
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  period: string; // YYYY-MM
  createdAt: string;
}

export interface HeadcountAnalytics {
  period: string;
  totalHeadcount: number;
  newHires: number;
  terminations: number;
  netChange: number;
  turnoverRate: number;
  byDepartment: {
    department: string;
    count: number;
    change: number;
  }[];
  byEntity: {
    entityId: string;
    entityName: string;
    count: number;
  }[];
}

export interface PayrollAnalytics {
  period: string;
  totalPayrollCost: number;
  averageSalary: number;
  medianSalary: number;
  costPerEmployee: number;
  overtimeCost: number;
  bonusCost: number;
  byDepartment: {
    department: string;
    totalCost: number;
    employeeCount: number;
    averageCost: number;
  }[];
  trends: {
    month: string;
    totalCost: number;
  }[];
}

export interface TurnoverAnalytics {
  period: string;
  totalTerminations: number;
  voluntaryTerminations: number;
  involuntaryTerminations: number;
  turnoverRate: number;
  avgTenure: number; // months
  byReason: {
    reason: string;
    count: number;
  }[];
  byDepartment: {
    department: string;
    turnoverRate: number;
  }[];
}

export interface ComplianceMetrics {
  period: string;
  wpsFilesGenerated: number;
  wpsFilesSubmitted: number;
  wpsComplianceRate: number;
  expiringDocuments: number;
  expiredDocuments: number;
  documentComplianceRate: number;
  laborLawViolations: number;
}

// ============================================================================
// ENTERPRISE: ROLE-BASED ACCESS CONTROL
// ============================================================================

export interface Role {
  id: string;
  roleName: string;
  roleCode: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  module: string; // 'employees', 'payroll', 'reports', etc.
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve' | 'export')[];
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  entityId?: string; // Scope to specific entity
  departmentId?: string; // Scope to specific department
  assignedBy: string;
  assignedDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: EMPLOYEE SELF-SERVICE
// ============================================================================

export interface EmployeePortalAccess {
  employeeId: string;
  username: string;
  lastLoginDate?: string;
  loginCount: number;
  isActive: boolean;
  passwordLastChanged: string;
}

export interface EmployeeRequest {
  id: string;
  employeeId: string;
  requestType: 'leave' | 'loan' | 'advance' | 'certificate' | 'document' | 'info_change' | 'other';
  requestDetails: any;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'completed';
  submittedDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCertificateRequest {
  id: string;
  employeeId: string;
  certificateType: 'employment' | 'salary' | 'experience' | 'to_whom_it_may_concern';
  purpose: string;
  addressedTo?: string;
  numberOfCopies: number;
  urgency: 'normal' | 'urgent';
  status: 'pending' | 'approved' | 'ready' | 'delivered' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  deliveredDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTERPRISE: EXPENSE MANAGEMENT
// ============================================================================

export interface ExpenseCategory {
  id: string;
  categoryName: string;
  categoryCode: string;
  maxAmount?: number;
  requiresReceipt: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  claimNumber: string;
  claimDate: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  expenses: ExpenseItem[];
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  payrollRunId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  categoryId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  notes?: string;
}

// ============================================================================
// ENTERPRISE: BENEFITS MANAGEMENT
// ============================================================================

export interface BenefitPlan {
  id: string;
  planName: string;
  planType: 'health_insurance' | 'life_insurance' | 'pension' | 'gym' | 'transport' | 'meal' | 'other';
  provider?: string;
  coverageAmount?: number;
  employeeContribution: number;
  employerContribution: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeBenefit {
  id: string;
  employeeId: string;
  benefitPlanId: string;
  benefitPlan?: BenefitPlan;
  enrollmentDate: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'suspended' | 'terminated';
  dependents?: Dependent[];
  createdAt: string;
  updatedAt: string;
}

export interface Dependent {
  id: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  dateOfBirth: string;
  isIncludedInBenefits: boolean;
}

// ============================================================================
// ENTERPRISE: ASSET MANAGEMENT
// ============================================================================

export interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  assetType: 'laptop' | 'mobile' | 'vehicle' | 'equipment' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  assignedTo?: string;
  assignedDate?: string;
  returnDueDate?: string;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  assignedDate: string;
  returnedDate?: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
