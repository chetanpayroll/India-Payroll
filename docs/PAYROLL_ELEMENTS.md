# Payroll Elements Management System

## Overview

Enterprise-grade payroll elements management system with country-specific compliance rules, advanced calculation engine, and comprehensive audit trail.

## Features

### ✨ Core Features

1. **Country-Specific Elements**
   - Support for multiple countries (UAE, India, and more)
   - Global elements applicable across all countries
   - Country-specific compliance mapping

2. **Flexible Element Types**
   - **Earnings**: Basic salary, allowances, bonuses, commissions
   - **Deductions**: Loans, advances, penalties, statutory deductions

3. **Permanent vs Temporary Elements**
   - **Permanent (Recurring)**: Regular monthly components
   - **Temporary (Non-Recurring)**: One-time payments or deductions

4. **Calculation Methods**
   - **Fixed Amount**: Flat monthly amount
   - **Percentage**: Percentage of basic or other elements
   - **Prorated**: Based on working days
   - **Rule-Based**: Advanced calculation rules with conditions

5. **Statutory Compliance**
   - Automatic identification of statutory elements
   - Compliance authority mapping (PF, ESIC, GPSSA, TDS, PT)
   - Wage ceilings and limits
   - Effective date tracking

6. **Advanced Calculation Rules**
   - **Statutory Calculations**: PF, ESIC, GPSSA with wage ceilings
   - **Conditional Formulas**: If-then-else logic
   - **Tiered Calculations**: Slab-based (Professional Tax, TDS)
   - **Attendance-Based**: LOP, proration
   - **Custom Formulas**: Safe mathematical expressions

## Database Schema

### Main Tables

#### 1. SalaryElement
Core payroll element definition

```typescript
{
  id: string
  code: string (unique)        // e.g., "IND_BASIC", "UAE_HOUSING"
  name: string                 // Display name
  nameArabic?: string          // Arabic translation
  type: EARNING | DEDUCTION
  category: ElementCategory    // BASIC_SALARY, HRA, PF_EMPLOYEE, etc.

  // Calculation
  calculationMethod: FIXED | PERCENTAGE | PRORATED
  percentageOf?: string        // Element code
  percentage?: number
  defaultAmount?: number

  // Classification
  isRecurring: boolean         // Permanent vs Temporary
  isTaxable: boolean
  isStatutory: boolean
  isSystemDefined: boolean     // Cannot be deleted
  isActive: boolean

  // Country
  countryCode?: string         // null = global

  // Display
  displayOrder: number
  showInPayslip: boolean
  description?: string
}
```

#### 2. PayrollElementRule
Advanced calculation rules

```typescript
{
  id: string
  elementId: string
  ruleName: string
  ruleType: STATUTORY_CALCULATION | CONDITIONAL_FORMULA |
            TIERED_CALCULATION | ATTENDANCE_BASED | CUSTOM

  // Conditions (JSON)
  conditions?: {
    field: string
    operator: '>' | '>=' | '<' | '<=' | '==' | '!=' | 'in'
    value: any
  }

  // Formula (JSON)
  formula: {
    // For statutory
    baseField?: string
    rate?: number
    ceiling?: number
    max?: number
    min?: number

    // For conditional
    condition?: object
    ifTrue?: object
    ifFalse?: object

    // For tiered
    slabs?: Array<{
      min: number
      max: number
      amount?: number
      rate?: number
    }>

    // For custom
    formula?: string  // e.g., "basic * 0.12"
  }

  // Applicability
  countryCode?: string
  state?: string              // For India PT
  effectiveFrom: Date
  effectiveTo?: Date
  priority: number            // Higher = more priority
  isActive: boolean
}
```

#### 3. PayrollElementComplianceMapping
Links elements to compliance authorities

```typescript
{
  id: string
  elementId: string
  countryCode: string
  complianceAuthority: string  // "PF", "ESIC", "TDS", "GPSSA"

  // Reporting
  reportingCode?: string
  reportingCategory?: string
  calculationReference?: string  // Law/circular reference

  // Limits
  wageceiling?: number
  minAmount?: number
  maxAmount?: number

  // Applicability
  applicabilityCriteria?: JSON
  effectiveFrom: Date
  effectiveTo?: Date
  isActive: boolean
  notes?: string
}
```

## API Endpoints

### Elements CRUD

```typescript
// Get all elements with filters
GET /api/payroll/elements?countryCode=INDIA&type=EARNING&isStatutory=true

// Get element by ID
GET /api/payroll/elements/:id

// Create element
POST /api/payroll/elements
Body: PayrollElementInput

// Update element
PUT /api/payroll/elements/:id
Body: Partial<PayrollElementInput>

// Delete element
DELETE /api/payroll/elements/:id
```

### Calculation Rules

```typescript
// Get rules for an element
GET /api/payroll/elements/rules?elementId=xxx

// Create rule
POST /api/payroll/elements/rules
Body: PayrollElementRuleInput

// Update rule
PUT /api/payroll/elements/rules/:id

// Delete rule
DELETE /api/payroll/elements/rules/:id
```

### Compliance Mappings

```typescript
// Get compliance mappings
GET /api/payroll/elements/compliance?elementId=xxx&countryCode=INDIA

// Create mapping
POST /api/payroll/elements/compliance
Body: ComplianceMappingInput
```

### Calculation Engine

```typescript
// Calculate all elements for an employee
POST /api/payroll/elements/calculate
Body: {
  employeeId: string
  countryCode: string
  calculationDate?: Date
}

Response: {
  success: true
  data: {
    IND_BASIC: 50000,
    IND_HRA: 25000,
    IND_PF_EMP: 1800,
    // ... all calculated amounts
  }
}
```

## Service Usage

### PayrollElementsService

```typescript
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

// Get all elements for a country
const elements = await payrollElementsService.getAllElements({
  countryCode: 'INDIA',
  isActive: true
})

// Create a new element
const element = await payrollElementsService.createElement({
  code: 'IND_BONUS',
  name: 'Performance Bonus',
  type: 'EARNING',
  category: 'BONUS',
  calculationMethod: 'FIXED',
  defaultAmount: 10000,
  countryCode: 'INDIA',
  isRecurring: false  // Temporary element
})

// Add calculation rule
const rule = await payrollElementsService.addRule({
  elementId: element.id,
  ruleName: 'PF Calculation',
  ruleType: 'STATUTORY_CALCULATION',
  formula: {
    baseField: 'IND_BASIC',
    rate: 0.12,
    ceiling: 15000,
    max: 1800
  },
  countryCode: 'INDIA',
  effectiveFrom: new Date('2024-01-01'),
  priority: 100
})

// Calculate element amount
const amount = await payrollElementsService.calculateElementAmount(
  'IND_PF_EMP',
  {
    employeeData: { employeeId: 'emp123' },
    salaryComponents: {
      IND_BASIC: 50000,
      IND_HRA: 25000
    },
    countryCode: 'INDIA'
  }
)
// Returns: 1800 (12% of 15000 due to ceiling)
```

## UI Features

### Dashboard (`/dashboard/payroll/elements`)

1. **Statistics Cards**
   - Total elements
   - Earnings count
   - Deductions count
   - Statutory elements
   - Permanent/Temporary breakdown

2. **Advanced Filtering**
   - Search by name/code
   - Filter by type (Earning/Deduction)
   - Filter by category
   - Filter by country
   - Filter by statutory status
   - Filter by recurring status

3. **Element Management**
   - Add new elements
   - Edit existing elements
   - Delete custom elements
   - Activate/Deactivate elements
   - Bulk export to Excel

4. **Visual Indicators**
   - Color-coded type badges
   - Icons for permanent/temporary
   - Shield icon for statutory elements
   - Status indicators (active/inactive)

## Pre-configured Elements

### UAE Elements

| Code | Name | Type | Category | Calculation |
|------|------|------|----------|-------------|
| UAE_BASIC | Basic Salary | Earning | BASIC_SALARY | Fixed |
| UAE_HOUSING | Housing Allowance | Earning | HOUSING_ALLOWANCE | 25% of Basic |
| UAE_TRANSPORT | Transport Allowance | Earning | TRANSPORT_ALLOWANCE | Fixed (500 AED) |
| UAE_FOOD | Food Allowance | Earning | FOOD_ALLOWANCE | Fixed (300 AED) |
| UAE_GPSSA_EMP | GPSSA Employee | Deduction | GPSSA_EMPLOYEE | 5% of Basic |
| UAE_GPSSA_ER | GPSSA Employer | Deduction | GPSSA_EMPLOYER | 15% of Basic |

### India Elements

| Code | Name | Type | Category | Calculation |
|------|------|------|----------|-------------|
| IND_BASIC | Basic Salary | Earning | BASIC_SALARY | Fixed |
| IND_HRA | House Rent Allowance | Earning | HRA | 50% of Basic |
| IND_LTA | Leave Travel Allowance | Earning | LTA | Fixed |
| IND_SPECIAL | Special Allowance | Earning | SPECIAL_ALLOWANCE | Fixed |
| IND_CONVEYANCE | Conveyance Allowance | Earning | CONVEYANCE | Fixed (₹1,600) |
| IND_MEDICAL | Medical Allowance | Earning | MEDICAL_ALLOWANCE | Fixed (₹1,250) |
| IND_PF_EMP | Employee PF | Deduction | PF_EMPLOYEE | 12% capped at ₹15,000 |
| IND_PF_ER | Employer PF | Deduction | PF_EMPLOYER | 12% capped at ₹15,000 |
| IND_ESIC_EMP | Employee ESIC | Deduction | ESIC_EMPLOYEE | 0.75% if gross ≤ ₹21,000 |
| IND_ESIC_ER | Employer ESIC | Deduction | ESIC_EMPLOYER | 3.25% if gross ≤ ₹21,000 |
| IND_PT | Professional Tax | Deduction | PROFESSIONAL_TAX | State-specific slabs |
| IND_TDS | TDS (Income Tax) | Deduction | TDS | Annual calculation |

## Calculation Examples

### Example 1: Fixed Amount

```typescript
Element: UAE_TRANSPORT
calculationMethod: FIXED
defaultAmount: 500

Result: 500 AED
```

### Example 2: Percentage

```typescript
Element: UAE_HOUSING
calculationMethod: PERCENTAGE
percentageOf: UAE_BASIC
percentage: 25

If basic = 10,000 AED
Result: 2,500 AED (25% of 10,000)
```

### Example 3: Statutory with Ceiling (PF)

```typescript
Rule Type: STATUTORY_CALCULATION
Formula: {
  baseField: 'IND_BASIC',
  rate: 0.12,
  ceiling: 15000,
  max: 1800
}

Case 1: Basic = 10,000
  → 10,000 * 0.12 = 1,200

Case 2: Basic = 50,000
  → min(50,000, 15,000) * 0.12 = 1,800 (capped)
```

### Example 4: Conditional (ESIC)

```typescript
Rule Type: CONDITIONAL_FORMULA
Formula: {
  condition: { field: 'gross', operator: '<=', value: 21000 },
  ifTrue: { formula: 'gross * 0.0075' },
  ifFalse: { formula: '0' }
}

Case 1: Gross = 18,000
  → 18,000 * 0.0075 = 135

Case 2: Gross = 25,000
  → 0 (not applicable)
```

### Example 5: Tiered (Professional Tax - Maharashtra)

```typescript
Rule Type: TIERED_CALCULATION
Formula: {
  slabs: [
    { min: 0, max: 10000, amount: 0 },
    { min: 10001, max: 15000, amount: 175 },
    { min: 15001, max: 20000, amount: 200 },
    { min: 20001, max: Infinity, amount: 200 }
  ]
}

Case 1: Gross = 8,000 → PT = 0
Case 2: Gross = 12,000 → PT = 175
Case 3: Gross = 18,000 → PT = 200
Case 4: Gross = 50,000 → PT = 200
```

## Migration Instructions

### 1. Update Database Schema

```bash
# Generate migration
npx prisma migrate dev --name add_payroll_elements_system

# Or in production
npx prisma migrate deploy
```

### 2. Seed Default Elements

```bash
# Run seed script
npx ts-node prisma/seeds/payroll-elements-seed.ts

# Or import in your main seed file
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

## Integration with Existing Payroll

The payroll elements system integrates seamlessly with your existing payroll processing:

```typescript
// In your payroll processing logic
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

async function processEmployeePayroll(employeeId: string, month: number, year: number) {
  // Get employee country
  const employee = await getEmployee(employeeId)
  const country = employee.countryCode

  // Calculate all elements
  const calculatedAmounts = await payrollElementsService.calculateAllElements(
    employeeId,
    country,
    new Date(year, month - 1, 1)
  )

  // Use calculated amounts for payroll processing
  const earnings = Object.entries(calculatedAmounts)
    .filter(([code]) => elements[code]?.type === 'EARNING')
    .reduce((sum, [_, amount]) => sum + amount, 0)

  const deductions = Object.entries(calculatedAmounts)
    .filter(([code]) => elements[code]?.type === 'DEDUCTION')
    .reduce((sum, [_, amount]) => sum + amount, 0)

  const netPay = earnings - deductions

  return { earnings, deductions, netPay }
}
```

## Best Practices

1. **Element Codes**: Use prefix for country (e.g., `IND_`, `UAE_`) for clarity
2. **System-Defined Elements**: Mark statutory elements as `isSystemDefined: true`
3. **Effective Dates**: Always set effective dates for rules and compliance mappings
4. **Priority**: Use higher priority for exception rules
5. **Testing**: Test calculation rules thoroughly with edge cases
6. **Audit Trail**: All changes are tracked automatically

## Security Considerations

1. **System Elements**: System-defined elements cannot be deleted
2. **Validation**: API validates all inputs before processing
3. **Safe Formulas**: Custom formulas use safe evaluation (no code execution)
4. **Audit Logging**: All changes are logged for compliance

## Future Enhancements

- [ ] Visual rule builder UI
- [ ] Bulk import/export of elements
- [ ] Element templates
- [ ] Versioning and history
- [ ] Multi-currency support
- [ ] Advanced validation rules
- [ ] Integration with tax calculators

## Support

For issues or questions:
- Check the API documentation
- Review calculation examples
- Contact: [Your Contact Info]

---

**Version**: 1.0.0
**Last Updated**: 2024-11-22
**Author**: Claude Code
