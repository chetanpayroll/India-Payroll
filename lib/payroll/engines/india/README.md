# India Payroll Engine

Complete payroll processing engine for India with statutory compliance.

## Features

- **Salary Structure**: Basic, HRA, LTA, Special Allowance, Conveyance, Medical
- **Provident Fund (PF)**: Employee and employer contributions, EPS, admin charges
- **ESIC**: Employee State Insurance for eligible employees (gross ≤ ₹21,000)
- **Professional Tax (PT)**: State-wise calculations for all Indian states
- **TDS**: Income tax with both Old and New tax regimes
- **Labour Welfare Fund (LWF)**: State-wise contributions
- **Compliance Reports**: Form 24Q, PF ECR, ESIC challan, PT challan

## Quick Start

```typescript
import { IndiaPayrollEngine } from '@/lib/payroll/engines/india';

const engine = new IndiaPayrollEngine();

// Process payroll
const payrollData = await engine.processPayroll(employee, period);

// Generate payslip
const payslip = engine.generatePayslip(payrollData);
```

## Tax Calculation

### New Tax Regime (FY 2024-25)

| Income Slab | Tax Rate |
|-------------|----------|
| Up to ₹3,00,000 | Nil |
| ₹3,00,001 - ₹7,00,000 | 5% |
| ₹7,00,001 - ₹10,00,000 | 10% |
| ₹10,00,001 - ₹12,00,000 | 15% |
| ₹12,00,001 - ₹15,00,000 | 20% |
| Above ₹15,00,000 | 30% |

- Standard Deduction: ₹50,000
- Rebate u/s 87A: Up to ₹25,000 for income up to ₹7,00,000

### Old Tax Regime

| Income Slab | Tax Rate |
|-------------|----------|
| Up to ₹2,50,000 | Nil |
| ₹2,50,001 - ₹5,00,000 | 5% |
| ₹5,00,001 - ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

- Rebate u/s 87A: Up to ₹12,500 for income up to ₹5,00,000
- Allows deductions: 80C, 80D, HRA, LTA, etc.

### Surcharge

| Taxable Income | Surcharge Rate |
|----------------|----------------|
| ₹50L - ₹1Cr | 10% |
| ₹1Cr - ₹2Cr | 15% |
| ₹2Cr - ₹5Cr | 25% |
| Above ₹5Cr | 37% |

- Health & Education Cess: 4% on (Tax + Surcharge)

## Provident Fund

```typescript
import { IndiaStatutoryCalculator } from '@/lib/payroll/engines/india';

const pfDetails = IndiaStatutoryCalculator.calculatePF(basicSalary, da);

// Returns:
// {
//   pfWage: number,
//   employeeContribution: number,  // 12% of PF wage
//   employerContribution: number,  // 12% of PF wage
//   eps: number,                   // 8.33% to EPS
//   epf: number,                   // 3.67% to EPF
//   adminCharges: number,          // 0.5% (min ₹500)
//   edliCharges: number            // 0.5%
// }
```

- **PF Wage Ceiling**: ₹15,000/month
- **Employee Contribution**: 12% of PF wage
- **Employer Contribution**: 12% (split as 8.33% EPS + 3.67% EPF)

## ESIC

```typescript
const esicDetails = IndiaStatutoryCalculator.calculateESIC(grossSalary);
```

- **Applicable**: Gross salary ≤ ₹21,000/month
- **Employee Rate**: 0.75%
- **Employer Rate**: 3.25%

## Professional Tax (State-wise)

```typescript
const ptDetails = IndiaStatutoryCalculator.calculatePT(grossSalary, 'KARNATAKA');
```

Supported states with different slabs:
- Maharashtra, Karnataka, Tamil Nadu, Telangana
- Andhra Pradesh, Gujarat, West Bengal, Kerala
- Madhya Pradesh, Odisha, Assam, Jharkhand, Bihar

**No PT States**: Punjab, Haryana, Rajasthan, Delhi, Uttar Pradesh

## Compliance Reports

### PF ECR (Electronic Challan cum Return)

```typescript
import { IndiaComplianceGenerator } from '@/lib/payroll/engines/india';

const ecr = IndiaComplianceGenerator.generatePFECR(
  month, year,
  establishmentCode,
  establishmentName,
  employees,
  payrollData
);

// Export to text for EPFO upload
const ecrText = IndiaComplianceGenerator.exportECRToText(ecr);
```

### Form 24Q (TDS Quarterly Statement)

```typescript
const form24Q = IndiaComplianceGenerator.generateForm24Q(
  quarter, // 1-4
  financialYear, // "2024-25"
  tanNumber,
  employerName,
  employees,
  payrollData
);
```

### ESIC Monthly

```typescript
const esicReport = IndiaComplianceGenerator.generateESICMonthly(
  month, year,
  establishmentCode,
  employees,
  payrollData
);
```

## Validation

```typescript
import { IndiaValidator } from '@/lib/payroll/engines/india';

// Validate PAN
const panResult = IndiaValidator.validatePAN('ABCDE1234F');

// Validate Aadhaar
const aadhaarResult = IndiaValidator.validateAadhaar('123456789012');

// Validate IFSC
const ifscResult = IndiaValidator.validateIFSC('HDFC0001234');

// Validate complete employee
const employeeResult = IndiaValidator.validateEmployee(employee);
```

## Updating Tax Slabs

To update tax slabs for a new financial year, modify `IndiaTaxCalculator.ts`:

```typescript
private static readonly NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 700000, rate: 0.05 },
  // ... update as needed
];
```

## Updating Statutory Rates

### PF Rates

```typescript
// In IndiaStatutoryCalculator.ts
static readonly PF_EMPLOYEE_RATE = 0.12; // 12%
static readonly EPS_RATE = 0.0833; // 8.33%
```

### ESIC Rates

```typescript
static readonly ESIC_WAGE_CEILING = 21000;
static readonly ESIC_EMPLOYEE_RATE = 0.0075; // 0.75%
static readonly ESIC_EMPLOYER_RATE = 0.0325; // 3.25%
```

### PT Slabs

Update the `PT_SLABS` object in `IndiaStatutoryCalculator.ts` with new slabs per state.

## File Structure

```
lib/payroll/engines/india/
├── IndiaPayrollEngine.ts      # Main engine implementation
├── IndiaTaxCalculator.ts      # TDS/Income tax calculations
├── IndiaStatutoryCalculator.ts # PF, ESIC, PT, LWF calculations
├── IndiaValidator.ts          # Validation for PAN, Aadhaar, IFSC
├── IndiaComplianceGenerator.ts # Compliance report generation
├── index.ts                   # Barrel exports
└── README.md                  # This file
```

## API Endpoints

- `POST /api/payroll/india/process` - Process payroll for employees
- `POST /api/payroll/india/tax-calculator` - Calculate/compare tax
- `POST /api/payroll/india/statutory` - Calculate statutory deductions
- `POST /api/payroll/set-country` - Set country selection

## Notes

1. **Financial Year**: India follows April-March (FY 2024-25 = Apr 2024 - Mar 2025)
2. **Working Days**: Default 26 days/month (5-day week)
3. **Currency**: All amounts in INR (Indian Rupees)
4. **PF Wage Ceiling**: Contributions calculated on ₹15,000 max unless voluntary higher PF opted
5. **ESIC Applicability**: Auto-disabled when gross exceeds ₹21,000
