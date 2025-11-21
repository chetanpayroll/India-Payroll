# India Payroll Module - Integration Guide

This guide explains how to integrate and deploy the India payroll module alongside the existing UAE payroll system.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        GMP Payroll System                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │  Country Select │────────▶│  PayrollEngine  │                │
│  │      Page       │         │    Factory      │                │
│  └────────┬────────┘         └────────┬────────┘                │
│           │                           │                          │
│           │                  ┌────────┴────────┐                │
│           │                  │                 │                │
│           ▼            ┌─────▼─────┐    ┌─────▼─────┐          │
│  ┌─────────────────┐  │    UAE    │    │   India   │          │
│  │ Country Context │  │  Engine   │    │  Engine   │          │
│  │   (Provider)    │  │(Existing) │    │   (New)   │          │
│  └─────────────────┘  └───────────┘    └───────────┘          │
│                                                                  │
│  Database:                                                       │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  PostgreSQL (Supabase)                                │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │     │
│  │  │UAE Tables   │  │India Tables │  │ Shared      │   │     │
│  │  │(Existing)   │  │(New)        │  │ (Country)   │   │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Installation Steps

### Step 1: Update Dependencies

No new dependencies required. The module uses existing packages:
- Next.js 14+
- TypeScript
- Prisma
- Tailwind CSS

### Step 2: Database Migration

Run Prisma migration to add India tables:

```bash
# Generate migration
npx prisma migrate dev --name add-india-payroll

# Or for production
npx prisma migrate deploy
```

This adds the following tables (WITHOUT modifying UAE tables):
- `Country` - Multi-country configuration
- `EmployeeIndia` - India employee records
- `IndiaTaxDeclaration` - Tax declarations (80C, 80D, etc.)
- `PayrollRunIndia` - India payroll runs
- `PayslipIndia` - India payslips
- `IndiaComplianceReport` - Compliance reports

### Step 3: Update Layout (Optional)

To add the CountryProvider to your app, update `app/layout.tsx`:

```tsx
import { CountryProvider } from '@/lib/context/CountryContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CountryProvider>
          {children}
        </CountryProvider>
      </body>
    </html>
  );
}
```

### Step 4: Environment Variables

Add to `.env` (optional India-specific settings):

```env
# India Payroll Config (optional - defaults are used)
INDIA_PF_CEILING=15000
INDIA_ESIC_CEILING=21000
```

### Step 5: Verify Deployment

After deployment, verify:

1. **Country Selection**: Visit `/dashboard/country-select`
2. **India Payroll**: Visit `/dashboard/payroll/india`
3. **Add Employee**: Visit `/dashboard/employees/india/new`
4. **UAE Still Works**: Visit `/dashboard/payroll` (existing UAE)

## New Routes Added

| Route | Purpose |
|-------|---------|
| `/dashboard/country-select` | Country selection page |
| `/dashboard/payroll/india` | India payroll dashboard |
| `/dashboard/payroll/india/new` | New India payroll run |
| `/dashboard/employees/india/new` | Add India employee |

## API Endpoints Added

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payroll/set-country` | POST/GET/DELETE | Manage country selection |
| `/api/payroll/india/process` | POST | Process India payroll |
| `/api/payroll/india/tax-calculator` | POST/GET | Tax calculations |
| `/api/payroll/india/statutory` | POST/GET | PF/ESIC/PT calculations |

## File Structure

```
gmppayroll-system/
├── app/
│   ├── dashboard/
│   │   ├── country-select/           # NEW - Country selection
│   │   │   └── page.tsx
│   │   ├── payroll/
│   │   │   ├── page.tsx              # UNCHANGED - UAE payroll
│   │   │   └── india/                # NEW - India payroll
│   │   │       ├── page.tsx
│   │   │       └── new/
│   │   │           └── page.tsx
│   │   └── employees/
│   │       └── india/                # NEW - India employees
│   │           └── new/
│   │               └── page.tsx
│   └── api/
│       └── payroll/
│           ├── set-country/          # NEW
│           │   └── route.ts
│           └── india/                # NEW
│               ├── process/
│               ├── tax-calculator/
│               └── statutory/
├── lib/
│   ├── context/
│   │   └── CountryContext.tsx        # NEW - Country state
│   └── payroll/                      # NEW - Payroll module
│       ├── core/
│       │   ├── types.ts
│       │   ├── IPayrollEngine.ts
│       │   └── countryConfig.ts
│       ├── engines/
│       │   └── india/
│       │       ├── IndiaPayrollEngine.ts
│       │       ├── IndiaTaxCalculator.ts
│       │       ├── IndiaStatutoryCalculator.ts
│       │       ├── IndiaValidator.ts
│       │       └── IndiaComplianceGenerator.ts
│       ├── factory.ts
│       └── index.ts
├── prisma/
│   └── schema.prisma                 # EXTENDED with India models
└── middleware.ts                     # NEW - Country routing
```

## Testing Checklist

### Before Deployment

- [ ] `npm run build` completes without errors
- [ ] `npx prisma generate` runs successfully
- [ ] TypeScript compiles without errors

### After Deployment

- [ ] UAE payroll page loads (`/dashboard/payroll`)
- [ ] Country selection page loads (`/dashboard/country-select`)
- [ ] Can select India and navigate to India payroll
- [ ] India payroll dashboard loads
- [ ] Can create new India payroll run
- [ ] Can add new India employee
- [ ] Tax calculations work correctly
- [ ] PF/ESIC/PT calculations are accurate
- [ ] Switching back to UAE works

### UAE Regression Tests

- [ ] Existing UAE employees still display
- [ ] Existing UAE payroll runs are intact
- [ ] Can create new UAE payroll run
- [ ] WPS file generation works
- [ ] GPSSA reports generate correctly

## Rollback Plan

If issues occur, the India module can be disabled:

1. Remove India routes from navigation
2. Set `INDIA` country to `isActive: false` in database
3. The UAE system continues to work independently

## Support

For issues or questions:
- Create an issue at: https://github.com/chetanpayroll/gmppayroll-system/issues
- Check the India engine README: `lib/payroll/engines/india/README.md`
