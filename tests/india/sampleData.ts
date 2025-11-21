// ============================================================================
// INDIA PAYROLL TEST DATA
// ============================================================================

import { IndiaEmployee, IndiaTaxDeclarations, PayrollPeriod } from '@/lib/payroll/core/types';

/**
 * Sample employees for testing India payroll calculations
 * Covers different salary ranges, states, and statutory applicability
 */
export const SAMPLE_INDIA_EMPLOYEES: IndiaEmployee[] = [
  // =========================================================================
  // Employee 1: High Salary - Senior Developer, Metro City
  // No ESIC (gross > 21000), High TDS, PF on ceiling
  // =========================================================================
  {
    id: 'IND-TEST-001',
    employeeCode: 'EMP001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@test.com',
    phone: '9876543210',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    dateOfJoining: new Date('2020-04-01'),
    department: 'Engineering',
    designation: 'Senior Developer',
    status: 'active',
    country: 'INDIA',

    pan: 'ABCPK1234F',
    aadhaar: '234567890123',
    uan: '100123456789',

    bankAccount: '12345678901234',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',

    salaryStructure: {
      basic: 80000,
      hra: 32000,
      lta: 6667,
      specialAllowance: 21333,
      conveyance: 0,
      medicalAllowance: 0,
      ctc: 1800000,
    },

    pfApplicable: true,
    esicApplicable: false,
    ptApplicable: true,
    lwfApplicable: true,

    taxRegime: 'NEW',

    state: 'KARNATAKA',
    city: 'Bengaluru',
    cityType: 'metro',
  },

  // =========================================================================
  // Employee 2: Medium Salary - Accountant, Metro City, Old Regime
  // PF on full basic (below ceiling), Tax with declarations
  // =========================================================================
  {
    id: 'IND-TEST-002',
    employeeCode: 'EMP002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@test.com',
    phone: '9876543211',
    dateOfBirth: new Date('1985-08-20'),
    gender: 'female',
    dateOfJoining: new Date('2021-01-15'),
    department: 'Finance',
    designation: 'Senior Accountant',
    status: 'active',
    country: 'INDIA',

    pan: 'FGHPS5678K',
    aadhaar: '345678901234',
    uan: '100234567890',

    bankAccount: '98765432109876',
    ifscCode: 'ICIC0002345',
    bankName: 'ICICI Bank',

    salaryStructure: {
      basic: 35000,
      hra: 14000,
      lta: 2917,
      specialAllowance: 8083,
      conveyance: 0,
      medicalAllowance: 0,
      ctc: 900000,
    },

    pfApplicable: true,
    esicApplicable: false,
    ptApplicable: true,
    lwfApplicable: true,

    taxRegime: 'OLD',
    declarations: {
      section80C: {
        ppf: 50000,
        elss: 50000,
        lifeInsurance: 30000,
        tuitionFees: 20000,
      },
      section80D: {
        selfAndFamily: 25000,
      },
      hraDetails: {
        rentPaid: 15000,
      },
    },

    state: 'MAHARASHTRA',
    city: 'Mumbai',
    cityType: 'metro',
  },

  // =========================================================================
  // Employee 3: Low Salary - Executive, Non-Metro
  // ESIC Applicable (gross <= 21000), Minimal TDS
  // =========================================================================
  {
    id: 'IND-TEST-003',
    employeeCode: 'EMP003',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@test.com',
    phone: '9876543212',
    dateOfBirth: new Date('1995-03-10'),
    gender: 'male',
    dateOfJoining: new Date('2023-06-01'),
    department: 'Operations',
    designation: 'Executive',
    status: 'active',
    country: 'INDIA',

    pan: 'KLMAP9012P',
    aadhaar: '456789012345',
    uan: '100345678901',
    esicNumber: '12345678901234567',

    bankAccount: '11223344556677',
    ifscCode: 'SBIN0003456',
    bankName: 'State Bank of India',

    salaryStructure: {
      basic: 12000,
      hra: 4800,
      lta: 1000,
      specialAllowance: 2200,
      conveyance: 0,
      medicalAllowance: 0,
      ctc: 300000,
    },

    pfApplicable: true,
    esicApplicable: true, // Gross = 20000 <= 21000
    ptApplicable: true,
    lwfApplicable: false,

    taxRegime: 'NEW',

    state: 'GUJARAT',
    city: 'Ahmedabad',
    cityType: 'non-metro',
  },

  // =========================================================================
  // Employee 4: High Salary - Manager, No PT State (Delhi)
  // =========================================================================
  {
    id: 'IND-TEST-004',
    employeeCode: 'EMP004',
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'neha.gupta@test.com',
    phone: '9876543213',
    dateOfBirth: new Date('1988-11-25'),
    gender: 'female',
    dateOfJoining: new Date('2019-08-01'),
    department: 'HR',
    designation: 'HR Manager',
    status: 'active',
    country: 'INDIA',

    pan: 'PQRNG3456U',
    aadhaar: '567890123456',
    uan: '100456789012',

    bankAccount: '55667788990011',
    ifscCode: 'KKBK0004567',
    bankName: 'Kotak Mahindra Bank',

    salaryStructure: {
      basic: 60000,
      hra: 30000, // 50% for metro
      lta: 5000,
      specialAllowance: 15000,
      conveyance: 0,
      medicalAllowance: 0,
      ctc: 1500000,
    },

    pfApplicable: true,
    esicApplicable: false,
    ptApplicable: true, // Will be 0 for Delhi
    lwfApplicable: true,

    taxRegime: 'NEW',

    state: 'DELHI',
    city: 'New Delhi',
    cityType: 'metro',
  },

  // =========================================================================
  // Employee 5: Entry Level - Tamil Nadu, Different PT Structure
  // =========================================================================
  {
    id: 'IND-TEST-005',
    employeeCode: 'EMP005',
    firstName: 'Karthik',
    lastName: 'Rajan',
    email: 'karthik.rajan@test.com',
    phone: '9876543214',
    dateOfBirth: new Date('1998-07-12'),
    gender: 'male',
    dateOfJoining: new Date('2024-01-02'),
    department: 'Sales',
    designation: 'Sales Executive',
    status: 'active',
    country: 'INDIA',

    pan: 'VWXKR7890A',
    aadhaar: '678901234567',
    uan: '100567890123',

    bankAccount: '99887766554433',
    ifscCode: 'IOBA0005678',
    bankName: 'Indian Overseas Bank',

    salaryStructure: {
      basic: 22000,
      hra: 8800,
      lta: 1833,
      specialAllowance: 5367,
      conveyance: 0,
      medicalAllowance: 0,
      ctc: 500000,
    },

    pfApplicable: true,
    esicApplicable: false,
    ptApplicable: true,
    lwfApplicable: false,

    taxRegime: 'NEW',

    state: 'TAMIL_NADU',
    city: 'Chennai',
    cityType: 'metro',
  },
];

/**
 * Sample payroll period for testing
 */
export const SAMPLE_PAYROLL_PERIOD: PayrollPeriod = {
  month: 11, // November
  year: 2024,
  financialYear: '2024-25',
  startDate: new Date('2024-11-01'),
  endDate: new Date('2024-11-30'),
  workingDays: 26,
  presentDays: 26,
};

/**
 * Expected results for validation
 */
export const EXPECTED_RESULTS = {
  'IND-TEST-001': {
    gross: 140000,
    pfEmployee: 1800, // 12% of 15000 ceiling
    pfEmployer: 1800,
    esic: 0,
    pt: 200, // Karnataka
    estimatedAnnualTDS: 180000, // Approximate
  },
  'IND-TEST-002': {
    gross: 60000,
    pfEmployee: 4200, // 12% of 35000
    pfEmployer: 4200,
    esic: 0,
    pt: 200, // Maharashtra (normal month)
    // TDS lower due to 80C deductions
  },
  'IND-TEST-003': {
    gross: 20000,
    pfEmployee: 1440, // 12% of 12000
    pfEmployer: 1440,
    esicEmployee: 150, // 0.75%
    esicEmployer: 650, // 3.25%
    pt: 200, // Gujarat
    tds: 0, // Below tax threshold
  },
  'IND-TEST-004': {
    gross: 110000,
    pfEmployee: 1800,
    pfEmployer: 1800,
    esic: 0,
    pt: 0, // Delhi - no PT
  },
  'IND-TEST-005': {
    gross: 38000,
    pfEmployee: 2640, // 12% of 22000
    pfEmployer: 2640,
    esic: 0,
    pt: 100, // Tamil Nadu (30001-45000 slab)
  },
};

/**
 * Tax calculation test cases
 */
export const TAX_TEST_CASES = [
  {
    name: 'Below threshold - No tax',
    annualIncome: 300000,
    regime: 'NEW' as const,
    expectedTax: 0,
  },
  {
    name: 'Eligible for 87A rebate',
    annualIncome: 700000,
    regime: 'NEW' as const,
    expectedTax: 0, // Full rebate
  },
  {
    name: 'Standard new regime calculation',
    annualIncome: 1000000,
    regime: 'NEW' as const,
    expectedTaxApprox: 54600, // With cess
  },
  {
    name: 'High income with surcharge',
    annualIncome: 6000000,
    regime: 'NEW' as const,
    expectedSurchargeRate: 0.1,
  },
  {
    name: 'Old regime with 80C',
    annualIncome: 1200000,
    regime: 'OLD' as const,
    declarations: {
      section80C: { ppf: 150000 },
    },
    // Lower tax due to deductions
  },
];

/**
 * Validation test cases
 */
export const VALIDATION_TEST_CASES = {
  pan: {
    valid: ['ABCDE1234F', 'ZZZZZ9999Z', 'AABCP1234C'],
    invalid: ['ABCDE1234', '12345ABCDE', 'abcde1234f', 'ABCDE12345'],
  },
  aadhaar: {
    valid: ['234567890123', '999988887777'],
    invalid: ['12345678901', '0234567890123', '1234567890123', '12345678901A'],
  },
  ifsc: {
    valid: ['HDFC0001234', 'SBIN0123456', 'ICIC0BRANCH'],
    invalid: ['HDFC1234567', 'HDF0001234', 'HDFC000123'],
  },
};
