/**
 * TAX DEDUCTED AT SOURCE (TDS) CALCULATION
 * FY 2024-25 Rules
 * Last Updated: December 2024
 */

export type TaxRegime = 'Old' | 'New';

interface TaxSlab {
    limit: number;
    rate: number;
}

const NEW_REGIME_SLABS: TaxSlab[] = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

const OLD_REGIME_SLABS: TaxSlab[] = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

export class TDSCalculator {
    private static readonly STANDARD_DEDUCTION = 50000; // Simplified for both if salary
    // Note: Budget 2023 introduced SD in New Regime too.

    private static readonly CESS_RATE = 0.04;

    /**
     * Calculate Monthly TDS
     * @param monthlyTaxableIncome Projected Monthly Income
     * @param regime 'Old' or 'New'
     * @param existingTDSAlreadyDeducted Total TDS deducted so far in FY
     * @param remainingMonths Months left in FY (inclusive of current)
     */
    static calculate(
        monthlyTaxableIncome: number,
        regime: TaxRegime = 'New',
        existingTDSAlreadyDeducted: number = 0,
        remainingMonths: number = 1
    ): number {
        // Simple annualized projection
        // In real system, this takes actuals + projected
        const annualGross = monthlyTaxableIncome * 12; // Simplified

        const netTaxableIncome = Math.max(0, annualGross - this.STANDARD_DEDUCTION);

        let annualTax = 0;

        if (regime === 'New') {
            annualTax = this.calculateTax(netTaxableIncome, NEW_REGIME_SLABS);
            // Rebate u/s 87A for New Regime (Income up to 7L -> Tax 0)
            if (netTaxableIncome <= 700000) annualTax = 0;
            // Marginal relief not implemented for simplicity
        } else {
            // Old regime logic requires Section 80C etc deductions. 
            // Assuming netTaxableIncome is already after deductions for simplicity here.
            annualTax = this.calculateTax(netTaxableIncome, OLD_REGIME_SLABS);
            // Rebate u/s 87A for Old Regime (Income up to 5L -> Tax 0)
            if (netTaxableIncome <= 500000) annualTax = 0;
        }

        const cess = annualTax * this.CESS_RATE;
        const totalAnnualLiability = annualTax + cess;

        const remainingLiability = Math.max(0, totalAnnualLiability - existingTDSAlreadyDeducted);

        if (remainingMonths <= 0) return remainingLiability;
        return Math.round(remainingLiability / remainingMonths);
    }

    private static calculateTax(income: number, slabs: TaxSlab[]): number {
        let tax = 0;
        let previousLimit = 0;

        for (const slab of slabs) {
            if (income > previousLimit) {
                const taxableAmount = Math.min(income, slab.limit) - previousLimit;
                tax += taxableAmount * slab.rate;
                previousLimit = slab.limit;
            } else {
                break;
            }
        }
        return tax;
    }
}
