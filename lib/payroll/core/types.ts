// ============================================================================
// MULTI-COUNTRY PAYROLL SYSTEM - CORE TYPES
// ============================================================================

export type CountryCode = 'INDIA';

export type Currency = 'INR';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

// ============================================================================
// SALARY COMPONENT TYPES
// ============================================================================

export interface SalaryComponents {
  basic: number;
  allowances: Record<string, number>;
  earnings: Record<string, number>;
  deductions?: Record<string, number>;
}

export interface Deductions {
  statutory: Record<string, number>;
  voluntary: Record<string, number>;
  total: number;
}

export interface Earnings {
  fixed: Record<string, number>;
  variable: Record<string, number>;
  total: number;
}

// ============================================================================
// PAYROLL DATA TYPES
// ============================================================================

export interface PayrollData {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  payPeriod: PayrollPeriod;
  earnings: PayrollEarning[];
  deductions: PayrollDeduction[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  employerContributions?: EmployerContribution[];
  taxDetails?: TaxDetails;
  metadata?: Record<string, any>;
}

export interface PayrollPeriod {
  month: number;
  year: number;
  financialYear?: string;
  startDate: Date;
  endDate: Date;
  workingDays: number;
  presentDays?: number;
}

export interface PayrollEarning {
  code: string;
  name: string;
  amount: number;
  isTaxable?: boolean;
  isStatutory?: boolean;
}

export interface PayrollDeduction {
  code: string;
  name: string;
  amount: number;
  isStatutory?: boolean;
  employeeShare?: number;
  employerShare?: number;
}

export interface EmployerContribution {
  code: string;
  name: string;
  amount: number;
}

export interface TaxDetails {
  taxableIncome: number;
  taxAmount: number;
  surcharge?: number;
  cess?: number;
  totalTax: number;
  regime?: string;
  exemptions?: Record<string, number>;
}

// ============================================================================
// PAYSLIP TYPES
// ============================================================================

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  dateOfJoining?: Date;

  // Period
  payPeriod: PayrollPeriod;
  payDate: Date;

  // Country-specific IDs
  countrySpecificIds: Record<string, string>;

  // Bank Details
  bankName?: string;
  accountNumber?: string;
  bankCode?: string; // IFSC for India, Swift for UAE

  // Earnings
  earnings: PayrollEarning[];
  grossEarnings: number;

  // Deductions
  deductions: PayrollDeduction[];
  totalDeductions: number;

  // Net
  netPay: number;
  netPayInWords: string;

  // Employer Contributions
  employerContributions?: EmployerContribution[];

  // YTD
  ytdEarnings?: number;
  ytdDeductions?: number;
  ytdNetPay?: number;

  // Tax Details
  taxDetails?: TaxDetails;

  // Status
  status: 'draft' | 'generated' | 'sent' | 'acknowledged';
  generatedAt: Date;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface Report {
  id: string;
  type: string;
  name: string;
  country: CountryCode;
  period: PayrollPeriod;
  data: any;
  format: 'pdf' | 'excel' | 'csv' | 'text';
  generatedAt: Date;
  status: 'pending' | 'generated' | 'submitted' | 'acknowledged';
}

// ============================================================================
// EMPLOYEE TYPES (Country-agnostic base)
// ============================================================================

export interface BaseEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  dateOfJoining: Date;
  department: string;
  designation: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_notice';
  country: CountryCode;
}

// ============================================================================
// INDIA-SPECIFIC TYPES
// ============================================================================

export interface IndiaEmployee extends BaseEmployee {
  country: 'INDIA';

  // Statutory IDs
  pan: string;
  aadhaar?: string;
  uan?: string;
  esicNumber?: string;

  // Bank Details
  bankAccount: string;
  ifscCode: string;
  bankName?: string;

  // Salary Structure
  salaryStructure: IndiaSalaryStructure;

  // Statutory Applicability
  pfApplicable: boolean;
  esicApplicable: boolean;
  ptApplicable: boolean;
  lwfApplicable?: boolean;

  // Tax Information
  taxRegime: 'OLD' | 'NEW';
  declarations?: IndiaTaxDeclarations;

  // Location
  state: string;
  city: string;
  cityType: 'metro' | 'non-metro';
}

export interface IndiaSalaryStructure {
  basic: number;
  hra: number;
  lta?: number;
  specialAllowance?: number;
  conveyance?: number;
  medicalAllowance?: number;
  otherAllowances?: Record<string, number>;
  ctc?: number;
}

export interface IndiaTaxDeclarations {
  // Section 80C (max 1.5L)
  section80C?: {
    ppf?: number;
    elss?: number;
    lifeInsurance?: number;
    nsc?: number;
    tuitionFees?: number;
    homeLoanPrincipal?: number;
    others?: number;
  };

  // Section 80D (Medical Insurance)
  section80D?: {
    selfAndFamily?: number;
    parents?: number;
    parentsAreSenior?: boolean;
  };

  // Section 80E (Education Loan Interest)
  section80E?: number;

  // Section 80G (Donations)
  section80G?: number;

  // Section 24 (Home Loan Interest)
  section24?: number;

  // HRA Exemption Details
  hraDetails?: {
    rentPaid: number;
    rentReceipts?: boolean;
    landlordPan?: string;
  };

  // LTA Details
  ltaDetails?: {
    claimAmount?: number;
    travelProof?: boolean;
  };
}

// ============================================================================
// INDIA STATUTORY TYPES
// ============================================================================

export interface IndiaPFDetails {
  pfWage: number;
  employeeContribution: number;
  employerContribution: number;
  eps: number; // Employer's EPS contribution
  epf: number; // Employer's EPF contribution
  adminCharges?: number;
  edliCharges?: number;
}

export interface IndiaESICDetails {
  grossWage: number;
  employeeContribution: number;
  employerContribution: number;
  isApplicable: boolean;
}

export interface IndiaPTDetails {
  state: string;
  grossSalary: number;
  ptAmount: number;
  frequency: 'monthly' | 'annual';
}

export interface IndiaTDSDetails {
  regime: 'OLD' | 'NEW';
  grossIncome: number;
  exemptions: Record<string, number>;
  deductions: Record<string, number>;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  monthlyTDS: number;
}

export interface IndiaGratuityDetails {
  yearsOfService: number;
  lastDrawnSalary: number; // Basic + DA
  gratuityAmount: number;
  isTaxable: boolean;
  taxExemptLimit: number;
}

// ============================================================================
// INDIA COMPLIANCE REPORT TYPES
// ============================================================================

export interface IndiaForm24Q {
  quarter: 1 | 2 | 3 | 4;
  financialYear: string;
  tanNumber: string;
  employerName: string;
  employees: Array<{
    pan: string;
    name: string;
    section: string;
    paymentDate: Date;
    amountPaid: number;
    tdsDeducted: number;
  }>;
  totalAmount: number;
  totalTDS: number;
}

export interface IndiaPFECR {
  month: number;
  year: number;
  establishmentCode: string;
  establishmentName: string;
  records: Array<{
    uan: string;
    memberName: string;
    grossWages: number;
    epfWages: number;
    epsWages: number;
    edliWages: number;
    epfContribution: number;
    epsContribution: number;
    epfEPSDiff: number;
    ncp: number;
  }>;
  summary: {
    totalEPFContribution: number;
    totalEPSContribution: number;
    totalEPFEPSDiff: number;
    adminCharges: number;
    totalDues: number;
  };
}

export interface IndiaESICMonthly {
  month: number;
  year: number;
  establishmentCode: string;
  records: Array<{
    esicNumber: string;
    name: string;
    grossWages: number;
    employeeContribution: number;
    employerContribution: number;
    ipDays: number;
  }>;
  totalContribution: number;
}
