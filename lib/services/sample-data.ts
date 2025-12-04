/**
 * India Payroll System - Sample Data Generator
 * Generates realistic sample data for demonstration
 */

import {
  Employee,
  PayrollRun,
  PayrollItem,
  LeaveRequest,
  Loan,
  SalaryAdvance,
  CompanySettings,
  PublicHoliday,
  SalaryAllowance,
} from '../types';
import { generateId } from '../utils';
import { calculateEmployeePayroll } from './payroll-calculator';

/**
 * Generate sample employees
 */
export function generateSampleEmployees(): Employee[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  const employees: Employee[] = [
    // 1. Rajesh Kumar - Senior Manager
    {
      id: generateId(),
      employeeCode: 'EMP001',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'India',
      religion: 'Hindu',
      email: 'rajesh.kumar@company.in',
      phoneNumber: '+91 98765 43210',
      address: 'Flat 101, Galaxy Apartments',
      city: 'Bangalore',
      emirate: 'Karnataka', // Using 'emirate' field for State for now to match type
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      uan: '100123456789',
      esicNumber: '31001234560001001',
      department: 'Engineering',
      designation: 'Senior Engineering Manager',
      costCenter: 'ENG001',
      employmentType: 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: '2015-01-10',
      contractStartDate: '2015-01-10',
      bankName: 'HDFC Bank',
      bankAccountNumber: '1234567890',
      ibanNumber: 'HDFC0001234', // Using IBAN field for IFSC
      basicSalary: 80000,
      housingAllowance: 40000,
      transportationAllowance: 5000,
      otherAllowances: [
        { id: generateId(), name: 'Special Allowance', amount: 20000, type: 'fixed', isTaxable: true, isWPSIncluded: false },
        { id: generateId(), name: 'Medical Allowance', amount: 1250, type: 'fixed', isTaxable: false, isWPSIncluded: false },
      ],
      annualLeaveBalance: 25,
      sickLeaveBalance: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 2. Priya Sharma - HR Manager
    {
      id: generateId(),
      employeeCode: 'EMP002',
      firstName: 'Priya',
      lastName: 'Sharma',
      dateOfBirth: '1988-07-22',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'India',
      email: 'priya.sharma@company.in',
      phoneNumber: '+91 98765 12345',
      address: 'House 45, Indiranagar',
      city: 'Bangalore',
      emirate: 'Karnataka',
      pan: 'FGHIJ5678K',
      aadhaar: '987654321098',
      uan: '100987654321',
      department: 'Human Resources',
      designation: 'HR Manager',
      costCenter: 'HR001',
      employmentType: 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: '2019-03-01',
      contractStartDate: '2019-03-01',
      bankName: 'ICICI Bank',
      bankAccountNumber: '9876543210',
      ibanNumber: 'ICIC0005678',
      basicSalary: 60000,
      housingAllowance: 30000,
      transportationAllowance: 3000,
      otherAllowances: [
        { id: generateId(), name: 'Special Allowance', amount: 15000, type: 'fixed', isTaxable: true, isWPSIncluded: false },
      ],
      annualLeaveBalance: 22,
      sickLeaveBalance: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 3. Amit Patel - Senior Developer
    {
      id: generateId(),
      employeeCode: 'EMP003',
      firstName: 'Amit',
      lastName: 'Patel',
      dateOfBirth: '1992-11-10',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'India',
      email: 'amit.patel@company.in',
      phoneNumber: '+91 99887 76655',
      address: 'Villa 234, Whitefield',
      city: 'Bangalore',
      emirate: 'Karnataka',
      pan: 'KLMNO9012P',
      aadhaar: '456789012345',
      uan: '100456789012',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      costCenter: 'ENG001',
      employmentType: 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: '2020-06-15',
      contractStartDate: '2020-06-15',
      bankName: 'SBI',
      bankAccountNumber: '2345678901',
      ibanNumber: 'SBIN0001234',
      basicSalary: 50000,
      housingAllowance: 25000,
      transportationAllowance: 3000,
      otherAllowances: [
        { id: generateId(), name: 'Special Allowance', amount: 10000, type: 'fixed', isTaxable: true, isWPSIncluded: false },
      ],
      annualLeaveBalance: 18,
      sickLeaveBalance: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },
  ];

  return employees;
}

/**
 * Generate sample company settings
 */
export function generateSampleCompanySettings(): CompanySettings {
  return {
    id: 'default',
    companyName: 'GMP Technologies India Pvt Ltd',
    panNumber: 'AAACG1234H',
    gstin: '29AAACG1234H1Z5',
    pfRegistrationNumber: 'KN/BNG/0012345/000',
    esicRegistrationNumber: '53000123450001001',
    address: 'Tech Park, Electronic City',
    city: 'Bangalore',
    emirate: 'Karnataka', // Using emirate for State
    poBox: '560100',
    phone: '+91 80 1234 5678',
    email: 'hr@gmptech.in',
    website: 'www.gmptech.in',
    payrollDayOfMonth: 30,
    weekendDays: [0, 6], // Sunday, Saturday
    publicHolidays: generateSamplePublicHolidays(),
    annualLeavePerYear: 18,
    sickLeaveFullPay: 12,
    maternityLeaveDays: 182, // 26 weeks
    paternityLeaveDays: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate India public holidays
 */
export function generateSamplePublicHolidays(): PublicHoliday[] {
  const currentYear = new Date().getFullYear();

  return [
    {
      id: generateId(),
      name: 'Republic Day',
      date: `${currentYear}-01-26`,
      isRecurring: true,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Independence Day',
      date: `${currentYear}-08-15`,
      isRecurring: true,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Gandhi Jayanti',
      date: `${currentYear}-10-02`,
      isRecurring: true,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Diwali',
      date: `${currentYear}-11-12`, // Approximate
      isRecurring: false,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Christmas',
      date: `${currentYear}-12-25`,
      isRecurring: true,
      year: currentYear,
    },
  ];
}

/**
 * Initialize system with sample data
 */
export function initializeSampleData() {
  const {
    employeeService,
    companySettingsService,
    publicHolidaysService,
  } = require('./data-service');

  // Check if data already exists
  if (employeeService.count() > 0) {
    console.log('Sample data already exists');
    return;
  }

  // Generate and save employees
  const employees = generateSampleEmployees();
  employees.forEach((employee) => {
    employeeService.collection.add(employee);
  });

  // Save company settings
  const settings = generateSampleCompanySettings();
  companySettingsService.updateSettings(settings);

  // Save public holidays
  const holidays = generateSamplePublicHolidays();
  holidays.forEach((holiday) => {
    publicHolidaysService.create(holiday);
  });

  console.log(`Sample data initialized: ${employees.length} employees`);
}
