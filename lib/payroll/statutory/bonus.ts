/**
 * BONUS CALCULATOR
 * Payment of Bonus Act, 1965
 * 
 * KEY RULES:
 * - Applicable to establishments with 20+ employees
 * - Minimum bonus: 8.33% of salary OR ₹100 (whichever is higher)
 * - Maximum bonus: 20% of salary
 */

export interface BonusCalculationInput {
    annualBasicSalary: number;  // Basic + DA for the year
    daysWorked: number;
    totalWorkingDays: number;  // Usually 365 or 366
    companyProfit?: number;     // For profit-based calculation
    dateOfJoining: Date;
    dateOfLeaving?: Date;
    financialYear: string;      // "2023-24"
}

export interface BonusCalculationResult {
    eligible: boolean;
    reason?: string;

    // Salary details
    annualSalary: number;
    cappedSalary: number;  // After applying ₹7,000/month cap

    // Working days
    daysWorked: number;
    totalDays: number;
    proportionateRatio: number;

    // Bonus calculation
    minimumBonus: number;  // 8.33%
    maximumBonus: number;  // 20%
    calculatedBonus: number;

    // Final amount
    bonusPayable: number;

    calculatedAt: Date;
    legalReference: string;
}

export class BonusCalculator {

    private static readonly MONTHLY_SALARY_CAP = 21000;
    private static readonly CALCULATION_SALARY_CAP = 7000;  // For bonus computation
    private static readonly MINIMUM_BONUS_RATE = 0.0833;  // 8.33%
    private static readonly MAXIMUM_BONUS_RATE = 0.20;    // 20%
    private static readonly MINIMUM_BONUS_AMOUNT = 100;
    private static readonly MINIMUM_WORKING_DAYS = 30;

    /**
     * Calculate annual bonus
     */
    static calculate(input: BonusCalculationInput): BonusCalculationResult {

        // Check eligibility (minimum 30 working days)
        if (input.daysWorked < this.MINIMUM_WORKING_DAYS) {
            return {
                eligible: false,
                reason: `Minimum ${this.MINIMUM_WORKING_DAYS} working days required. Employee worked ${input.daysWorked} days.`,
                annualSalary: input.annualBasicSalary,
                cappedSalary: 0,
                daysWorked: input.daysWorked,
                totalDays: input.totalWorkingDays,
                proportionateRatio: 0,
                minimumBonus: 0,
                maximumBonus: 0,
                calculatedBonus: 0,
                bonusPayable: 0,
                calculatedAt: new Date(),
                legalReference: 'Payment of Bonus Act, 1965'
            };
        }

        // Calculate average monthly salary
        const monthlyAverage = input.annualBasicSalary / 12;

        // Check salary cap applicability
        if (monthlyAverage > this.MONTHLY_SALARY_CAP) {
            return {
                eligible: false,
                reason: `Bonus not applicable for monthly salary > ₹${this.MONTHLY_SALARY_CAP}. Employee's average: ₹${monthlyAverage.toFixed(2)}`,
                annualSalary: input.annualBasicSalary,
                cappedSalary: 0,
                daysWorked: input.daysWorked,
                totalDays: input.totalWorkingDays,
                proportionateRatio: 0,
                minimumBonus: 0,
                maximumBonus: 0,
                calculatedBonus: 0,
                bonusPayable: 0,
                calculatedAt: new Date(),
                legalReference: 'Payment of Bonus Act, 1965'
            };
        }

        // Apply computation cap (₹7,000/month)
        const cappedMonthly = Math.min(monthlyAverage, this.CALCULATION_SALARY_CAP);
        const cappedAnnual = cappedMonthly * 12;

        // Calculate proportionate ratio
        const proportionateRatio = input.daysWorked / input.totalWorkingDays;

        // Calculate bonus amounts
        const minimumBonus = Math.max(
            cappedAnnual * this.MINIMUM_BONUS_RATE,
            this.MINIMUM_BONUS_AMOUNT
        );

        const maximumBonus = cappedAnnual * this.MAXIMUM_BONUS_RATE;

        // For simplicity, use minimum bonus (employers can pay more based on profit)
        // In advanced implementation, calculate based on available surplus
        let calculatedBonus = minimumBonus;

        // If company profit data available, calculate based on allocable surplus
        if (input.companyProfit) {
            calculatedBonus = this.calculateProfitBasedBonus(
                input.companyProfit,
                cappedAnnual,
                input.daysWorked,
                input.totalWorkingDays
            );

            // Ensure within min-max range
            calculatedBonus = Math.max(minimumBonus, Math.min(calculatedBonus, maximumBonus));
        }

        // Apply proportionate for part year
        const bonusPayable = Math.round(calculatedBonus * proportionateRatio);

        return {
            eligible: true,
            annualSalary: input.annualBasicSalary,
            cappedSalary: cappedAnnual,
            daysWorked: input.daysWorked,
            totalDays: input.totalWorkingDays,
            proportionateRatio,
            minimumBonus,
            maximumBonus,
            calculatedBonus,
            bonusPayable,
            calculatedAt: new Date(),
            legalReference: 'Payment of Bonus Act, 1965'
        };
    }

    /**
     * Calculate bonus based on company profit (advanced calculation)
     */
    private static calculateProfitBasedBonus(
        companyProfit: number,
        employeeSalary: number,
        daysWorked: number,
        totalDays: number
    ): number {
        // Simplified profit-based calculation
        // Allocable surplus = 67% of profit or available surplus after deductions
        const allocableSurplus = companyProfit * 0.67;

        // Calculate bonus as percentage of allocable surplus
        // This is a simplified version - actual calculation is complex
        const bonusFromProfit = employeeSalary * 0.10; // 10% as example

        return bonusFromProfit;
    }
}
