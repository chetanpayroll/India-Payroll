/**
 * UAE Payroll System - Sample Data Generator
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
    // 1. Ahmed Mohammed - Senior UAE National
    {
      id: generateId(),
      employeeCode: 'EMP001',
      firstName: 'Ahmed',
      middleName: 'Mohammed',
      lastName: 'Al Maktoum',
      fullNameArabic: 'أحمد محمد المكتوم',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'UAE',
      religion: 'Muslim',
      email: 'ahmed.almaktoum@company.ae',
      phoneNumber: '+971 50 123 4567',
      address: 'Villa 123, Al Barsha',
      city: 'Dubai',
      emirate: 'Dubai',
      emiratesId: '784-1985-1234567-1',
      emiratesIdExpiry: `${currentYear + 2}-03-15`,
      passportNumber: 'N1234567',
      passportExpiry: `${currentYear + 3}-03-15`,
      visaNumber: 'V1234567',
      visaType: 'employment',
      visaExpiry: `${currentYear + 2}-03-15`,
      laborCardNumber: 'LC001234567',
      laborCardExpiry: `${currentYear + 2}-03-15`,
      department: 'Finance',
      designation: 'Finance Director',
      costCenter: 'FIN001',
      employmentType: 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: '2015-01-10',
      contractStartDate: '2015-01-10',
      bankName: 'Emirates NBD',
      bankAccountNumber: '1234567890',
      ibanNumber: 'AE070331234567890123456',
      basicSalary: 25000,
      housingAllowance: 15000,
      transportationAllowance: 3000,
      otherAllowances: [
        { id: generateId(), name: 'Phone Allowance', amount: 500, type: 'fixed', isTaxable: false, isWPSIncluded: true },
        { id: generateId(), name: 'Education Allowance', amount: 2000, type: 'fixed', isTaxable: false, isWPSIncluded: true },
      ],
      annualLeaveBalance: 25,
      sickLeaveBalance: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 2. Sarah Johnson - HR Manager
    {
      id: generateId(),
      employeeCode: 'EMP002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1988-07-22',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'United Kingdom',
      religion: 'Christian',
      email: 'sarah.johnson@company.ae',
      phoneNumber: '+971 55 234 5678',
      address: 'Apartment 45, Dubai Marina',
      city: 'Dubai',
      emirate: 'Dubai',
      emiratesId: '784-1988-7654321-2',
      emiratesIdExpiry: `${currentYear + 1}-07-22`,
      passportNumber: 'GB9876543',
      passportExpiry: `${currentYear + 4}-07-22`,
      visaNumber: 'V9876543',
      visaType: 'employment',
      visaExpiry: `${currentYear + 1}-07-22`,
      laborCardNumber: 'LC009876543',
      laborCardExpiry: `${currentYear + 1}-07-22`,
      department: 'Human Resources',
      designation: 'HR Manager',
      costCenter: 'HR001',
      employmentType: 'limited',
      employmentStatus: 'active',
      dateOfJoining: '2019-03-01',
      contractStartDate: '2019-03-01',
      contractEndDate: `${currentYear + 1}-02-28`,
      bankName: 'HSBC',
      bankAccountNumber: '9876543210',
      ibanNumber: 'AE330219876543210123456',
      basicSalary: 18000,
      housingAllowance: 10000,
      transportationAllowance: 2500,
      otherAllowances: [
        { id: generateId(), name: 'Phone Allowance', amount: 500, type: 'fixed', isTaxable: false, isWPSIncluded: true },
      ],
      annualLeaveBalance: 22,
      sickLeaveBalance: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 3. Fatima Al Zaabi - Marketing Specialist
    {
      id: generateId(),
      employeeCode: 'EMP003',
      firstName: 'Fatima',
      lastName: 'Al Zaabi',
      fullNameArabic: 'فاطمة الزعابي',
      dateOfBirth: '1992-11-10',
      gender: 'female',
      maritalStatus: 'married',
      nationality: 'UAE',
      religion: 'Muslim',
      email: 'fatima.alzaabi@company.ae',
      phoneNumber: '+971 50 345 6789',
      address: 'Villa 234, Al Ain',
      city: 'Al Ain',
      emirate: 'Abu Dhabi',
      emiratesId: '784-1992-2345678-3',
      emiratesIdExpiry: `${currentYear + 3}-11-10`,
      passportNumber: 'N2345678',
      passportExpiry: `${currentYear + 4}-11-10`,
      visaNumber: 'V2345678',
      visaType: 'employment',
      visaExpiry: `${currentYear + 3}-11-10`,
      laborCardNumber: 'LC002345678',
      laborCardExpiry: `${currentYear + 3}-11-10`,
      department: 'Marketing',
      designation: 'Marketing Specialist',
      costCenter: 'MKT001',
      employmentType: 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: '2020-06-15',
      contractStartDate: '2020-06-15',
      bankName: 'Abu Dhabi Commercial Bank',
      bankAccountNumber: '2345678901',
      ibanNumber: 'AE240032345678901234567',
      basicSalary: 12000,
      housingAllowance: 7000,
      transportationAllowance: 2000,
      otherAllowances: [
        { id: generateId(), name: 'Phone Allowance', amount: 300, type: 'fixed', isTaxable: false, isWPSIncluded: true },
      ],
      annualLeaveBalance: 28,
      sickLeaveBalance: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 4. Raj Kumar - Software Developer
    {
      id: generateId(),
      employeeCode: 'EMP004',
      firstName: 'Raj',
      lastName: 'Kumar',
      dateOfBirth: '1990-05-08',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'India',
      religion: 'Hindu',
      email: 'raj.kumar@company.ae',
      phoneNumber: '+971 55 456 7890',
      address: 'Apartment 12, International City',
      city: 'Dubai',
      emirate: 'Dubai',
      emiratesId: '784-1990-3456789-4',
      emiratesIdExpiry: `${currentYear + 1}-05-08`,
      passportNumber: 'J3456789',
      passportExpiry: `${currentYear + 2}-05-08`,
      visaNumber: 'V3456789',
      visaType: 'employment',
      visaExpiry: `${currentYear + 1}-05-08`,
      laborCardNumber: 'LC003456789',
      laborCardExpiry: `${currentYear + 1}-05-08`,
      department: 'IT',
      designation: 'Senior Software Developer',
      costCenter: 'IT001',
      employmentType: 'limited',
      employmentStatus: 'active',
      dateOfJoining: '2018-09-01',
      contractStartDate: '2018-09-01',
      contractEndDate: `${currentYear + 1}-08-31`,
      bankName: 'Mashreq Bank',
      bankAccountNumber: '3456789012',
      ibanNumber: 'AE150043456789012345678',
      basicSalary: 14000,
      housingAllowance: 8000,
      transportationAllowance: 2000,
      otherAllowances: [
        { id: generateId(), name: 'Phone Allowance', amount: 500, type: 'fixed', isTaxable: false, isWPSIncluded: true },
      ],
      annualLeaveBalance: 18,
      sickLeaveBalance: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 5. Maria Garcia - Sales Executive
    {
      id: generateId(),
      employeeCode: 'EMP005',
      firstName: 'Maria',
      lastName: 'Garcia',
      dateOfBirth: '1993-09-14',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'Philippines',
      religion: 'Catholic',
      email: 'maria.garcia@company.ae',
      phoneNumber: '+971 50 567 8901',
      address: 'Apartment 78, Discovery Gardens',
      city: 'Dubai',
      emirate: 'Dubai',
      emiratesId: '784-1993-4567890-5',
      emiratesIdExpiry: `${currentYear + 1}-09-14`,
      passportNumber: 'P4567890',
      passportExpiry: `${currentYear + 2}-09-14`,
      visaNumber: 'V4567890',
      visaType: 'employment',
      visaExpiry: `${currentYear + 1}-09-14`,
      laborCardNumber: 'LC004567890',
      laborCardExpiry: `${currentYear + 1}-09-14`,
      department: 'Sales',
      designation: 'Sales Executive',
      costCenter: 'SAL001',
      employmentType: 'limited',
      employmentStatus: 'active',
      dateOfJoining: '2021-02-15',
      contractStartDate: '2021-02-15',
      contractEndDate: `${currentYear + 1}-02-14`,
      bankName: 'Commercial Bank of Dubai',
      bankAccountNumber: '4567890123',
      ibanNumber: 'AE060054567890123456789',
      basicSalary: 10000,
      housingAllowance: 6000,
      transportationAllowance: 1500,
      otherAllowances: [
        { id: generateId(), name: 'Phone Allowance', amount: 300, type: 'fixed', isTaxable: false, isWPSIncluded: true },
        { id: generateId(), name: 'Sales Incentive', amount: 1000, type: 'variable', isTaxable: false, isWPSIncluded: true },
      ],
      annualLeaveBalance: 26,
      sickLeaveBalance: 88,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 6. Mohammed Al Hashimi - Operations Manager
    {
      id: generateId(),
      employeeCode: 'EMP006',
      firstName: 'Mohammed',
      lastName: 'Al Hashimi',
      fullNameArabic: 'محمد الهاشمي',
      dateOfBirth: '1982-04-20',
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'UAE',
      religion: 'Muslim',
      email: 'mohammed.alhashimi@company.ae',
      phoneNumber: '+971 50 678 9012',
      address: 'Villa 567, Jumeirah',
      city: 'Dubai',
      emirate: 'Dubai',
      emiratesId: '784-1982-5678901-6',
      emiratesIdExpiry: `${currentYear + 4}-04-20`,
      passportNumber: 'N5678901',
      passportExpiry: `${currentYear + 5}-04-20`,
      visaNumber: 'V5678901',
      visaType: 'employment',
      visaExpiry: `${currentYear + 4}-04-20`,
      laborCardNumber: 'LC005678901',
      laborCardExpiry: `${currentYear + 4}-04-20`,
      department: 'Operations',
      designation: 'Operations Manager',
      costCenter: 'OPS001',
      employmentType: 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: '2012-05-01',
      contractStartDate: '2012-05-01',
      bankName: 'Emirates NBD',
      bankAccountNumber: '5678901234',
      ibanNumber: 'AE070335678901234567890',
      basicSalary: 22000,
      housingAllowance: 12000,
      transportationAllowance: 3000,
      otherAllowances: [
        { id: generateId(), name: 'Phone Allowance', amount: 500, type: 'fixed', isTaxable: false, isWPSIncluded: true },
        { id: generateId(), name: 'Fuel Allowance', amount: 1500, type: 'fixed', isTaxable: false, isWPSIncluded: true },
      ],
      annualLeaveBalance: 20,
      sickLeaveBalance: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },

    // 7-15: Additional employees with varied profiles
    ...generateAdditionalEmployees(7),
  ];

  return employees;
}

function generateAdditionalEmployees(startNumber: number): Employee[] {
  const employees: Employee[] = [];
  const currentYear = new Date().getFullYear();

  const profiles = [
    {
      firstName: 'John',
      lastName: 'Smith',
      nationality: 'USA',
      department: 'IT',
      designation: 'Systems Administrator',
      salary: 16000,
    },
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      nationality: 'India',
      department: 'Finance',
      designation: 'Senior Accountant',
      salary: 13000,
    },
    {
      firstName: 'Ali',
      lastName: 'Hassan',
      nationality: 'Egypt',
      department: 'Sales',
      designation: 'Sales Manager',
      salary: 20000,
    },
    {
      firstName: 'Emma',
      lastName: 'Wilson',
      nationality: 'Canada',
      department: 'Marketing',
      designation: 'Marketing Manager',
      salary: 19000,
    },
    {
      firstName: 'Hassan',
      lastName: 'Abdullah',
      nationality: 'UAE',
      department: 'Operations',
      designation: 'Operations Supervisor',
      salary: 15000,
    },
    {
      firstName: 'Chen',
      lastName: 'Wei',
      nationality: 'China',
      department: 'IT',
      designation: 'Database Administrator',
      salary: 14500,
    },
    {
      firstName: 'Nadia',
      lastName: 'Farooq',
      nationality: 'Pakistan',
      department: 'HR',
      designation: 'HR Officer',
      salary: 11000,
    },
    {
      firstName: 'James',
      lastName: 'Brown',
      nationality: 'Australia',
      department: 'Finance',
      designation: 'Financial Analyst',
      salary: 17000,
    },
    {
      firstName: 'Sofia',
      lastName: 'Martinez',
      nationality: 'Spain',
      department: 'Marketing',
      designation: 'Content Specialist',
      salary: 10500,
    },
  ];

  profiles.forEach((profile, index) => {
    const empNumber = startNumber + index;
    const empId = generateId();

    employees.push({
      id: empId,
      employeeCode: `EMP${String(empNumber).padStart(3, '0')}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: `19${85 + index}-0${(index % 9) + 1}-15`,
      gender: index % 2 === 0 ? 'male' : 'female',
      maritalStatus: index % 3 === 0 ? 'married' : 'single',
      nationality: profile.nationality,
      email: `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@company.ae`,
      phoneNumber: `+971 55 ${String(700 + empNumber).padStart(3, '0')} ${String(1000 + empNumber).padStart(4, '0')}`,
      address: `Apartment ${100 + empNumber}, Dubai`,
      city: 'Dubai',
      emirate: 'Dubai',
      emiratesId: `784-19${85 + index}-${String(1000000 + empNumber).substring(1)}-${index % 9 + 1}`,
      emiratesIdExpiry: `${currentYear + 1}-12-31`,
      passportNumber: `P${String(1000000 + empNumber).substring(1)}`,
      passportExpiry: `${currentYear + 2}-12-31`,
      visaNumber: `V${String(1000000 + empNumber).substring(1)}`,
      visaType: 'employment',
      visaExpiry: `${currentYear + 1}-12-31`,
      laborCardNumber: `LC${String(100000000 + empNumber).substring(1)}`,
      laborCardExpiry: `${currentYear + 1}-12-31`,
      department: profile.department,
      designation: profile.designation,
      costCenter: `${profile.department.substring(0, 3).toUpperCase()}001`,
      employmentType: index % 2 === 0 ? 'limited' : 'unlimited',
      employmentStatus: 'active',
      dateOfJoining: `${2018 + (index % 5)}-0${(index % 11) + 1}-01`,
      contractStartDate: `${2018 + (index % 5)}-0${(index % 11) + 1}-01`,
      contractEndDate: index % 2 === 0 ? `${currentYear + 1}-12-31` : undefined,
      bankName: ['Emirates NBD', 'HSBC', 'Mashreq Bank', 'ADCB'][index % 4],
      bankAccountNumber: String(1000000000 + empNumber * 123),
      ibanNumber: `AE0${(index % 9) + 1}0${(index % 9) + 1}${String(10000000000000000 + empNumber * 12345).substring(0, 18)}`,
      basicSalary: profile.salary,
      housingAllowance: Math.round(profile.salary * 0.5),
      transportationAllowance: Math.round(profile.salary * 0.15),
      otherAllowances: [
        {
          id: generateId(),
          name: 'Phone Allowance',
          amount: 300,
          type: 'fixed',
          isTaxable: false,
          isWPSIncluded: true,
        },
      ],
      annualLeaveBalance: 20 + (index % 10),
      sickLeaveBalance: 80 + (index % 20),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    });
  });

  return employees;
}

/**
 * Generate sample company settings
 */
export function generateSampleCompanySettings(): CompanySettings {
  return {
    id: 'default',
    companyName: 'GMP Technologies LLC',
    companyNameArabic: 'شركة جي إم بي للتكنولوجيا',
    tradeLicenseNumber: 'TL-123456-2020',
    establishmentNumber: 'EST-789012',
    wpsRegistrationNumber: 'WPS-345678',
    mohreCompanyId: 'MOHRE-901234',
    address: 'Office 1501, Business Tower, Sheikh Zayed Road',
    city: 'Dubai',
    emirate: 'Dubai',
    poBox: 'P.O. Box 123456',
    phone: '+971 4 123 4567',
    email: 'hr@gmptech.ae',
    website: 'www.gmptech.ae',
    payrollDayOfMonth: 28,
    weekendDays: [5, 6], // Friday, Saturday
    publicHolidays: generateSamplePublicHolidays(),
    annualLeavePerYear: 30,
    sickLeaveFullPay: 90,
    maternityLeaveDays: 60,
    paternityLeaveDays: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate UAE public holidays
 */
export function generateSamplePublicHolidays(): PublicHoliday[] {
  const currentYear = new Date().getFullYear();

  return [
    {
      id: generateId(),
      name: 'New Year\'s Day',
      nameArabic: 'رأس السنة الميلادية',
      date: `${currentYear}-01-01`,
      isRecurring: true,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Eid Al Fitr',
      nameArabic: 'عيد الفطر',
      date: `${currentYear}-04-21`,
      isRecurring: false,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Arafat Day',
      nameArabic: 'يوم عرفة',
      date: `${currentYear}-06-27`,
      isRecurring: false,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Eid Al Adha',
      nameArabic: 'عيد الأضحى',
      date: `${currentYear}-06-28`,
      isRecurring: false,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Islamic New Year',
      nameArabic: 'رأس السنة الهجرية',
      date: `${currentYear}-07-19`,
      isRecurring: false,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Prophet Muhammad\'s Birthday',
      nameArabic: 'المولد النبوي',
      date: `${currentYear}-09-27`,
      isRecurring: false,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'Commemoration Day',
      nameArabic: 'يوم الشهيد',
      date: `${currentYear}-11-30`,
      isRecurring: true,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'UAE National Day',
      nameArabic: 'اليوم الوطني',
      date: `${currentYear}-12-02`,
      isRecurring: true,
      year: currentYear,
    },
    {
      id: generateId(),
      name: 'UAE National Day Holiday',
      nameArabic: 'عطلة اليوم الوطني',
      date: `${currentYear}-12-03`,
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
