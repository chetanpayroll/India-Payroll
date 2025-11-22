import { PrismaClient, ElementType, ElementCategory, CalculationMethod, RuleType } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedPayrollElements() {
  console.log('🌱 Seeding payroll elements...')

  // ========================================
  // UAE PAYROLL ELEMENTS
  // ========================================

  // UAE Earnings
  const uaeBasic = await prisma.salaryElement.upsert({
    where: { code: 'UAE_BASIC' },
    update: {},
    create: {
      code: 'UAE_BASIC',
      name: 'Basic Salary',
      nameArabic: 'الراتب الأساسي',
      type: ElementType.EARNING,
      category: ElementCategory.BASIC_SALARY,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      countryCode: 'UAE',
      isStatutory: false,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 1,
      showInPayslip: true,
      description: 'Basic salary component for UAE employees'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'UAE_HOUSING' },
    update: {},
    create: {
      code: 'UAE_HOUSING',
      name: 'Housing Allowance',
      nameArabic: 'بدل السكن',
      type: ElementType.EARNING,
      category: ElementCategory.HOUSING_ALLOWANCE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'UAE_BASIC',
      percentage: 25,
      countryCode: 'UAE',
      isStatutory: false,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 2,
      showInPayslip: true,
      description: 'Housing allowance - typically 25% of basic salary'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'UAE_TRANSPORT' },
    update: {},
    create: {
      code: 'UAE_TRANSPORT',
      name: 'Transport Allowance',
      nameArabic: 'بدل المواصلات',
      type: ElementType.EARNING,
      category: ElementCategory.TRANSPORT_ALLOWANCE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      defaultAmount: 500,
      countryCode: 'UAE',
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 3,
      showInPayslip: true,
      description: 'Monthly transport allowance'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'UAE_FOOD' },
    update: {},
    create: {
      code: 'UAE_FOOD',
      name: 'Food Allowance',
      nameArabic: 'بدل الطعام',
      type: ElementType.EARNING,
      category: ElementCategory.FOOD_ALLOWANCE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      defaultAmount: 300,
      countryCode: 'UAE',
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 4,
      showInPayslip: true,
      description: 'Monthly food allowance'
    }
  })

  // UAE GPSSA (for Emirati nationals)
  const uaeGpssaEmp = await prisma.salaryElement.upsert({
    where: { code: 'UAE_GPSSA_EMP' },
    update: {},
    create: {
      code: 'UAE_GPSSA_EMP',
      name: 'GPSSA Employee Contribution',
      nameArabic: 'مساهمة الموظف في التقاعد',
      type: ElementType.DEDUCTION,
      category: ElementCategory.GPSSA_EMPLOYEE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'UAE_BASIC',
      percentage: 5,
      countryCode: 'UAE',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 90,
      showInPayslip: true,
      description: 'Employee pension contribution - 5% of basic salary (Emirati nationals only)'
    }
  })

  const uaeGpssaEr = await prisma.salaryElement.upsert({
    where: { code: 'UAE_GPSSA_ER' },
    update: {},
    create: {
      code: 'UAE_GPSSA_ER',
      name: 'GPSSA Employer Contribution',
      nameArabic: 'مساهمة صاحب العمل في التقاعد',
      type: ElementType.DEDUCTION,
      category: ElementCategory.GPSSA_EMPLOYER,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'UAE_BASIC',
      percentage: 15,
      countryCode: 'UAE',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 91,
      showInPayslip: false,
      description: 'Employer pension contribution - 15% of basic salary (Emirati nationals only)'
    }
  })

  // GPSSA Calculation Rules
  await prisma.payrollElementRule.create({
    data: {
      elementId: uaeGpssaEmp.id,
      ruleName: 'GPSSA Employee Contribution (5%)',
      ruleType: RuleType.STATUTORY_CALCULATION,
      formula: {
        baseField: 'UAE_BASIC',
        rate: 0.05,
        min: 0
      },
      countryCode: 'UAE',
      effectiveFrom: new Date('2020-01-01'),
      priority: 100,
      isActive: true,
      description: 'GPSSA employee contribution as per UAE pension law'
    }
  })

  await prisma.payrollElementRule.create({
    data: {
      elementId: uaeGpssaEr.id,
      ruleName: 'GPSSA Employer Contribution (15%)',
      ruleType: RuleType.STATUTORY_CALCULATION,
      formula: {
        baseField: 'UAE_BASIC',
        rate: 0.15,
        min: 0
      },
      countryCode: 'UAE',
      effectiveFrom: new Date('2020-01-01'),
      priority: 100,
      isActive: true,
      description: 'GPSSA employer contribution as per UAE pension law'
    }
  })

  // GPSSA Compliance Mappings
  await prisma.payrollElementComplianceMapping.create({
    data: {
      elementId: uaeGpssaEmp.id,
      countryCode: 'UAE',
      complianceAuthority: 'GPSSA',
      reportingCode: 'GPSSA_EMP',
      reportingCategory: 'PENSION_EMPLOYEE',
      calculationReference: 'Federal Law No. 7 of 1999 on Pension and Social Security',
      effectiveFrom: new Date('2020-01-01'),
      isActive: true,
      notes: 'Applicable to UAE nationals only'
    }
  })

  await prisma.payrollElementComplianceMapping.create({
    data: {
      elementId: uaeGpssaEr.id,
      countryCode: 'UAE',
      complianceAuthority: 'GPSSA',
      reportingCode: 'GPSSA_EMP_ER',
      reportingCategory: 'PENSION_EMPLOYER',
      calculationReference: 'Federal Law No. 7 of 1999 on Pension and Social Security',
      effectiveFrom: new Date('2020-01-01'),
      isActive: true,
      notes: 'Employer contribution - applicable to UAE nationals only'
    }
  })

  // ========================================
  // INDIA PAYROLL ELEMENTS
  // ========================================

  // India Earnings
  const indiaBasic = await prisma.salaryElement.upsert({
    where: { code: 'IND_BASIC' },
    update: {},
    create: {
      code: 'IND_BASIC',
      name: 'Basic Salary',
      type: ElementType.EARNING,
      category: ElementCategory.BASIC_SALARY,
      isRecurring: true,
      isTaxable: true,
      calculationMethod: CalculationMethod.FIXED,
      countryCode: 'INDIA',
      isStatutory: false,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 1,
      showInPayslip: true,
      description: 'Basic salary component - typically 40-50% of CTC'
    }
  })

  const indiaHra = await prisma.salaryElement.upsert({
    where: { code: 'IND_HRA' },
    update: {},
    create: {
      code: 'IND_HRA',
      name: 'House Rent Allowance',
      type: ElementType.EARNING,
      category: ElementCategory.HRA,
      isRecurring: true,
      isTaxable: true,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'IND_BASIC',
      percentage: 50,
      countryCode: 'INDIA',
      isStatutory: false,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 2,
      showInPayslip: true,
      description: 'House Rent Allowance - typically 50% of basic salary'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'IND_LTA' },
    update: {},
    create: {
      code: 'IND_LTA',
      name: 'Leave Travel Allowance',
      type: ElementType.EARNING,
      category: ElementCategory.LTA,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      defaultAmount: 2000,
      countryCode: 'INDIA',
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 3,
      showInPayslip: true,
      description: 'Leave Travel Allowance - tax exempt up to specified limits'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'IND_SPECIAL' },
    update: {},
    create: {
      code: 'IND_SPECIAL',
      name: 'Special Allowance',
      type: ElementType.EARNING,
      category: ElementCategory.SPECIAL_ALLOWANCE,
      isRecurring: true,
      isTaxable: true,
      calculationMethod: CalculationMethod.FIXED,
      countryCode: 'INDIA',
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 4,
      showInPayslip: true,
      description: 'Special allowance to balance CTC'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'IND_CONVEYANCE' },
    update: {},
    create: {
      code: 'IND_CONVEYANCE',
      name: 'Conveyance Allowance',
      type: ElementType.EARNING,
      category: ElementCategory.CONVEYANCE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      defaultAmount: 1600,
      countryCode: 'INDIA',
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 5,
      showInPayslip: true,
      description: 'Conveyance allowance - tax exempt up to ₹1,600/month (₹19,200/year)'
    }
  })

  await prisma.salaryElement.upsert({
    where: { code: 'IND_MEDICAL' },
    update: {},
    create: {
      code: 'IND_MEDICAL',
      name: 'Medical Allowance',
      type: ElementType.EARNING,
      category: ElementCategory.MEDICAL_ALLOWANCE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      defaultAmount: 1250,
      countryCode: 'INDIA',
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 6,
      showInPayslip: true,
      description: 'Medical allowance - tax exempt up to ₹15,000/year'
    }
  })

  // India Statutory Deductions

  // PF (Provident Fund)
  const indiaPfEmp = await prisma.salaryElement.upsert({
    where: { code: 'IND_PF_EMP' },
    update: {},
    create: {
      code: 'IND_PF_EMP',
      name: 'Employee PF',
      type: ElementType.DEDUCTION,
      category: ElementCategory.PF_EMPLOYEE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'IND_BASIC',
      percentage: 12,
      countryCode: 'INDIA',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 90,
      showInPayslip: true,
      description: 'Employee Provident Fund - 12% of basic (capped at ₹15,000 wage ceiling)'
    }
  })

  const indiaPfEr = await prisma.salaryElement.upsert({
    where: { code: 'IND_PF_ER' },
    update: {},
    create: {
      code: 'IND_PF_ER',
      name: 'Employer PF',
      type: ElementType.DEDUCTION,
      category: ElementCategory.PF_EMPLOYER,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'IND_BASIC',
      percentage: 12,
      countryCode: 'INDIA',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 91,
      showInPayslip: false,
      description: 'Employer Provident Fund contribution - 12% (3.67% to PF, 8.33% to Pension)'
    }
  })

  // PF Calculation Rules
  await prisma.payrollElementRule.create({
    data: {
      elementId: indiaPfEmp.id,
      ruleName: 'PF Employee Contribution (12% capped at ₹15,000)',
      ruleType: RuleType.STATUTORY_CALCULATION,
      formula: {
        baseField: 'IND_BASIC',
        rate: 0.12,
        ceiling: 15000,
        max: 1800, // 12% of 15,000
        min: 0
      },
      countryCode: 'INDIA',
      effectiveFrom: new Date('2024-01-01'),
      priority: 100,
      isActive: true,
      description: 'PF calculation as per Employees Provident Fund Act, 1952'
    }
  })

  await prisma.payrollElementRule.create({
    data: {
      elementId: indiaPfEr.id,
      ruleName: 'PF Employer Contribution (12% capped at ₹15,000)',
      ruleType: RuleType.STATUTORY_CALCULATION,
      formula: {
        baseField: 'IND_BASIC',
        rate: 0.12,
        ceiling: 15000,
        max: 1800,
        min: 0
      },
      countryCode: 'INDIA',
      effectiveFrom: new Date('2024-01-01'),
      priority: 100,
      isActive: true,
      description: 'Employer PF contribution (3.67% to EPF + 8.33% to EPS)'
    }
  })

  // ESIC (Employee State Insurance)
  const indiaEsicEmp = await prisma.salaryElement.upsert({
    where: { code: 'IND_ESIC_EMP' },
    update: {},
    create: {
      code: 'IND_ESIC_EMP',
      name: 'Employee ESIC',
      type: ElementType.DEDUCTION,
      category: ElementCategory.ESIC_EMPLOYEE,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'GROSS',
      percentage: 0.75,
      countryCode: 'INDIA',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 92,
      showInPayslip: true,
      description: 'Employee State Insurance - 0.75% of gross (applicable if gross ≤ ₹21,000)'
    }
  })

  const indiaEsicEr = await prisma.salaryElement.upsert({
    where: { code: 'IND_ESIC_ER' },
    update: {},
    create: {
      code: 'IND_ESIC_ER',
      name: 'Employer ESIC',
      type: ElementType.DEDUCTION,
      category: ElementCategory.ESIC_EMPLOYER,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.PERCENTAGE,
      percentageOf: 'GROSS',
      percentage: 3.25,
      countryCode: 'INDIA',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 93,
      showInPayslip: false,
      description: 'Employer State Insurance contribution - 3.25% of gross'
    }
  })

  // ESIC Calculation Rules
  await prisma.payrollElementRule.create({
    data: {
      elementId: indiaEsicEmp.id,
      ruleName: 'ESIC Employee Contribution (0.75% if gross ≤ ₹21,000)',
      ruleType: RuleType.CONDITIONAL_FORMULA,
      conditions: {
        field: 'gross',
        operator: '<=',
        value: 21000
      },
      formula: {
        condition: { field: 'gross', operator: '<=', value: 21000 },
        ifTrue: { formula: 'gross * 0.0075' },
        ifFalse: { formula: '0' }
      },
      countryCode: 'INDIA',
      effectiveFrom: new Date('2024-01-01'),
      priority: 100,
      isActive: true,
      description: 'ESIC applicable only if gross salary ≤ ₹21,000'
    }
  })

  // Professional Tax (State-specific)
  const indiaPt = await prisma.salaryElement.upsert({
    where: { code: 'IND_PT' },
    update: {},
    create: {
      code: 'IND_PT',
      name: 'Professional Tax',
      type: ElementType.DEDUCTION,
      category: ElementCategory.PROFESSIONAL_TAX,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      countryCode: 'INDIA',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 94,
      showInPayslip: true,
      description: 'Professional Tax - state-specific (max ₹2,500/year)'
    }
  })

  // PT Rules for different states
  await prisma.payrollElementRule.create({
    data: {
      elementId: indiaPt.id,
      ruleName: 'PT - Maharashtra',
      ruleType: RuleType.TIERED_CALCULATION,
      formula: {
        baseField: 'gross',
        slabs: [
          { min: 0, max: 10000, amount: 0 },
          { min: 10001, max: 15000, amount: 175 },
          { min: 15001, max: 20000, amount: 200 },
          { min: 20001, max: Infinity, amount: 200 } // ₹300 in Feb
        ]
      },
      countryCode: 'INDIA',
      state: 'Maharashtra',
      effectiveFrom: new Date('2024-01-01'),
      priority: 100,
      isActive: true,
      description: 'Professional Tax slabs for Maharashtra'
    }
  })

  await prisma.payrollElementRule.create({
    data: {
      elementId: indiaPt.id,
      ruleName: 'PT - Karnataka',
      ruleType: RuleType.TIERED_CALCULATION,
      formula: {
        baseField: 'gross',
        slabs: [
          { min: 0, max: 15000, amount: 0 },
          { min: 15001, max: Infinity, amount: 200 }
        ]
      },
      countryCode: 'INDIA',
      state: 'Karnataka',
      effectiveFrom: new Date('2024-01-01'),
      priority: 100,
      isActive: true,
      description: 'Professional Tax slabs for Karnataka'
    }
  })

  // TDS (Tax Deducted at Source)
  const indiaTds = await prisma.salaryElement.upsert({
    where: { code: 'IND_TDS' },
    update: {},
    create: {
      code: 'IND_TDS',
      name: 'TDS (Income Tax)',
      type: ElementType.DEDUCTION,
      category: ElementCategory.TDS,
      isRecurring: true,
      isTaxable: false,
      calculationMethod: CalculationMethod.FIXED,
      countryCode: 'INDIA',
      isStatutory: true,
      isSystemDefined: true,
      isActive: true,
      displayOrder: 95,
      showInPayslip: true,
      description: 'Tax Deducted at Source - calculated based on annual salary and tax regime'
    }
  })

  // Compliance Mappings
  await prisma.payrollElementComplianceMapping.create({
    data: {
      elementId: indiaPfEmp.id,
      countryCode: 'INDIA',
      complianceAuthority: 'PF',
      reportingCode: 'EPF_EMP',
      reportingCategory: 'PROVIDENT_FUND',
      calculationReference: 'Employees Provident Fund Act, 1952',
      wageceiling: 15000,
      maxAmount: 1800,
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      notes: 'Employee contribution to EPF - 12% of basic + DA capped at ₹15,000'
    }
  })

  await prisma.payrollElementComplianceMapping.create({
    data: {
      elementId: indiaEsicEmp.id,
      countryCode: 'INDIA',
      complianceAuthority: 'ESIC',
      reportingCode: 'ESIC_EMP',
      reportingCategory: 'EMPLOYEE_INSURANCE',
      calculationReference: 'ESI Act, 1948',
      wageceiling: 21000,
      applicabilityCriteria: {
        maxGrossSalary: 21000
      },
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      notes: 'Applicable if gross salary ≤ ₹21,000/month'
    }
  })

  await prisma.payrollElementComplianceMapping.create({
    data: {
      elementId: indiaPt.id,
      countryCode: 'INDIA',
      complianceAuthority: 'PT',
      reportingCode: 'PT',
      reportingCategory: 'PROFESSIONAL_TAX',
      calculationReference: 'State-specific PT Acts',
      maxAmount: 2500,
      applicabilityCriteria: {
        note: 'State-wise slabs apply. Max ₹2,500/year as per central limit'
      },
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      notes: 'State-specific slabs. Not applicable in all states.'
    }
  })

  await prisma.payrollElementComplianceMapping.create({
    data: {
      elementId: indiaTds.id,
      countryCode: 'INDIA',
      complianceAuthority: 'TDS',
      reportingCode: 'TDS_SALARY',
      reportingCategory: 'INCOME_TAX',
      calculationReference: 'Income Tax Act, 1961',
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      notes: 'Calculated based on estimated annual income and tax regime (OLD/NEW)'
    }
  })

  console.log('✅ Payroll elements seeded successfully!')
  console.log(`   - UAE elements: 6`)
  console.log(`   - India elements: 11`)
  console.log(`   - Total elements: 17`)
  console.log(`   - Calculation rules created`)
  console.log(`   - Compliance mappings created`)
}

// Run seed if called directly
if (require.main === module) {
  seedPayrollElements()
    .then(() => {
      console.log('✅ Seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
