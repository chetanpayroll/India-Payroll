# India Payroll Module - Test Cases

## Test Data

### Sample Employees

```typescript
// Employee 1: High Salary - No ESIC, High TDS
const employee1 = {
  id: 'TEST001',
  firstName: 'Rajesh',
  lastName: 'Kumar',
  pan: 'ABCDE1234F',
  basic: 80000,
  hra: 32000,
  specialAllowance: 28000,
  // Gross: 140000/month = 16.8L/year
  pfApplicable: true,
  esicApplicable: false, // Gross > 21000
  ptApplicable: true,
  taxRegime: 'NEW',
  state: 'KARNATAKA',
  cityType: 'metro'
};

// Employee 2: Medium Salary - PF on ceiling
const employee2 = {
  id: 'TEST002',
  firstName: 'Priya',
  lastName: 'Sharma',
  pan: 'FGHIJ5678K',
  basic: 35000,
  hra: 14000,
  specialAllowance: 11000,
  // Gross: 60000/month = 7.2L/year
  pfApplicable: true,
  esicApplicable: false,
  ptApplicable: true,
  taxRegime: 'NEW',
  state: 'MAHARASHTRA',
  cityType: 'metro'
};

// Employee 3: Low Salary - ESIC Applicable
const employee3 = {
  id: 'TEST003',
  firstName: 'Amit',
  lastName: 'Patel',
  pan: 'KLMNO9012P',
  basic: 12000,
  hra: 4800,
  specialAllowance: 3200,
  // Gross: 20000/month = 2.4L/year
  pfApplicable: true,
  esicApplicable: true, // Gross <= 21000
  ptApplicable: true,
  taxRegime: 'NEW',
  state: 'GUJARAT',
  cityType: 'non-metro'
};

// Employee 4: Senior Citizen - Old Regime
const employee4 = {
  id: 'TEST004',
  firstName: 'Ramesh',
  lastName: 'Verma',
  pan: 'PQRST3456U',
  basic: 50000,
  hra: 20000,
  specialAllowance: 15000,
  // Gross: 85000/month = 10.2L/year
  pfApplicable: false, // Senior, retired
  esicApplicable: false,
  ptApplicable: true,
  taxRegime: 'OLD',
  state: 'DELHI',
  cityType: 'metro',
  age: 62,
  declarations: {
    section80C: { ppf: 50000, elss: 50000, lic: 30000 },
    section80D: { selfAndFamily: 50000 }
  }
};

// Employee 5: Fresher - Low Tax
const employee5 = {
  id: 'TEST005',
  firstName: 'Sneha',
  lastName: 'Gupta',
  pan: 'VWXYZ7890A',
  basic: 25000,
  hra: 10000,
  specialAllowance: 5000,
  // Gross: 40000/month = 4.8L/year
  pfApplicable: true,
  esicApplicable: false,
  ptApplicable: true,
  taxRegime: 'NEW',
  state: 'TAMIL_NADU',
  cityType: 'metro'
};
```

## Test Cases

### 1. Provident Fund (PF) Calculations

#### Test 1.1: Basic below ceiling
```
Input: Basic = 12000, DA = 0
Expected:
  - PF Wage = 12000
  - Employee PF = 1440 (12%)
  - Employer PF = 1440 (12%)
  - EPS = 1000 (8.33%)
  - EPF = 440 (3.67%)
```

#### Test 1.2: Basic above ceiling
```
Input: Basic = 50000, DA = 0, No voluntary higher PF
Expected:
  - PF Wage = 15000 (ceiling)
  - Employee PF = 1800 (12% of 15000)
  - Employer PF = 1800
  - EPS = 1250 (8.33% of 15000)
  - EPF = 550 (3.67% of 15000)
```

#### Test 1.3: Basic with DA
```
Input: Basic = 10000, DA = 3000
Expected:
  - PF Wage = 13000 (Basic + DA)
  - Employee PF = 1560 (12%)
```

### 2. ESIC Calculations

#### Test 2.1: ESIC Applicable
```
Input: Gross = 18000
Expected:
  - Is Applicable = true
  - Employee ESIC = 135 (0.75%)
  - Employer ESIC = 585 (3.25%)
```

#### Test 2.2: ESIC Not Applicable
```
Input: Gross = 25000
Expected:
  - Is Applicable = false
  - Employee ESIC = 0
  - Employer ESIC = 0
```

#### Test 2.3: ESIC at Ceiling
```
Input: Gross = 21000
Expected:
  - Is Applicable = true
  - Employee ESIC = 158 (rounded)
  - Employer ESIC = 683 (rounded)
```

### 3. Professional Tax (PT)

#### Test 3.1: Karnataka
```
Input: Gross = 25000, State = KARNATAKA
Expected: PT = 200
```

#### Test 3.2: Maharashtra
```
Input: Gross = 15000, State = MAHARASHTRA
Expected: PT = 200
```

#### Test 3.3: Maharashtra February
```
Input: Gross = 15000, State = MAHARASHTRA, Month = 2
Expected: PT = 300 (special Feb rate)
```

#### Test 3.4: No PT State
```
Input: Gross = 100000, State = PUNJAB
Expected: PT = 0
```

#### Test 3.5: Tamil Nadu High Salary
```
Input: Gross = 80000, State = TAMIL_NADU
Expected: PT = 1095 (highest slab)
```

### 4. TDS Calculations - New Regime

#### Test 4.1: Below Tax Threshold
```
Input: Annual Income = 300000, Regime = NEW
Expected:
  - Standard Deduction = 50000
  - Taxable Income = 250000
  - Tax = 0 (below 3L threshold)
```

#### Test 4.2: Eligible for 87A Rebate
```
Input: Annual Income = 700000, Regime = NEW
Expected:
  - Taxable Income = 650000
  - Tax before rebate = 17500
  - Rebate 87A = 17500
  - Total Tax = 0
```

#### Test 4.3: Above 87A Limit
```
Input: Annual Income = 1000000, Regime = NEW
Expected:
  - Taxable Income = 950000
  - Tax = 52500
  - Cess = 2100
  - Total = 54600
  - Monthly TDS = 4550
```

#### Test 4.4: High Income with Surcharge
```
Input: Annual Income = 6000000, Regime = NEW
Expected:
  - Taxable Income = 5950000
  - Base Tax = 1335000
  - Surcharge (10%) = 133500
  - Cess (4%) = 58740
  - Total = 1527240
```

### 5. TDS Calculations - Old Regime

#### Test 5.1: With 80C Deductions
```
Input:
  Annual Income = 1000000
  Regime = OLD
  80C = 150000
Expected:
  - Taxable = 800000 (1000000 - 50000 SD - 150000 80C)
  - Tax = 52500
```

#### Test 5.2: With HRA Exemption
```
Input:
  Annual Basic = 600000
  Annual HRA = 240000
  Annual Rent = 200000
  City = Metro
Expected HRA Exemption:
  - Option 1: Actual HRA = 240000
  - Option 2: Rent - 10% Basic = 140000
  - Option 3: 50% Basic = 300000
  - Exemption = 140000 (minimum)
```

#### Test 5.3: Senior Citizen Slabs
```
Input: Annual Income = 500000, Age = 65, Regime = OLD
Expected:
  - Uses senior citizen slabs
  - Taxable = 450000 (after SD)
  - Tax = 7500 (5% of 150000 above 3L threshold)
```

### 6. Complete Payroll Processing

#### Test 6.1: Employee 1 (High Salary)
```
Input: Employee 1, Month = November 2024
Expected:
  Basic: 80000
  HRA: 32000
  Special: 28000
  Gross: 140000

  Deductions:
    PF: 1800 (on 15000 ceiling)
    ESIC: 0 (not applicable)
    PT: 200 (Karnataka)
    TDS: ~15000 (calculated)

  Net: ~123000
```

#### Test 6.2: Employee 3 (ESIC Applicable)
```
Input: Employee 3, Month = November 2024
Expected:
  Gross: 20000

  Deductions:
    PF: 1440 (12% of 12000 basic)
    ESIC: 150 (0.75% of 20000)
    PT: 150 (Gujarat)
    TDS: 0 (income below threshold)

  Net: 18260
```

### 7. Validation Tests

#### Test 7.1: Valid PAN
```
Input: "ABCDE1234F"
Expected: Valid
```

#### Test 7.2: Invalid PAN
```
Input: "ABCDE1234"
Expected: Invalid - wrong length
```

#### Test 7.3: Valid Aadhaar
```
Input: "234567890123"
Expected: Valid
```

#### Test 7.4: Invalid Aadhaar (starts with 0)
```
Input: "012345678901"
Expected: Invalid - cannot start with 0 or 1
```

#### Test 7.5: Valid IFSC
```
Input: "HDFC0001234"
Expected: Valid
```

#### Test 7.6: Invalid IFSC
```
Input: "HDFC1234567"
Expected: Invalid - 5th char must be 0
```

### 8. Edge Cases

#### Test 8.1: Zero Salary
```
Input: Basic = 0
Expected: Validation error - Basic must be > 0
```

#### Test 8.2: LOP Days
```
Input: Basic = 30000, Working Days = 26, Present Days = 20
Expected: Pro-rated Basic = 30000 * 20/26 = 23077
```

#### Test 8.3: Mid-year Joining
```
Input: Join Date = Oct 2024, Process Month = Nov 2024
Expected: YTD calculations should show 2 months data
```

### 9. Compliance Report Tests

#### Test 9.1: PF ECR Generation
```
Input: 3 PF-applicable employees
Expected:
  - 3 employee records
  - Correct UAN format
  - Total contributions match sum
```

#### Test 9.2: Form 24Q Quarter
```
Input: Q3 (Oct-Dec), FY 2024-25
Expected:
  - Only Oct, Nov, Dec data
  - Correct TAN format
  - Aggregated TDS by employee
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- india-payroll

# Run with coverage
npm test -- --coverage
```

## Test Environment Setup

1. Use test database (not production)
2. Clear test data before each run
3. Use fixed dates for reproducibility
4. Mock external services

## Performance Benchmarks

| Operation | Expected Time |
|-----------|--------------|
| Single payroll calculation | < 50ms |
| Bulk payroll (100 employees) | < 2s |
| Tax comparison (both regimes) | < 100ms |
| ECR generation (100 records) | < 500ms |
