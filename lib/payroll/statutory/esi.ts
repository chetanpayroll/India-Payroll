/**
 * EMPLOYEE STATE INSURANCE (ESI) CALCULATION
 * Reference: ESI Act, 1948
 * Last Updated: December 2024
 * 
 * IMPORTANT RULES:
 * 1. Eligibility: Gross Salary <= ₹21,000 (₹25,000 for persons with disability)
 * 2. Contribution Period: April-Sept, Oct-March
 * 3. Employee Share: 0.75% of Gross Salary
 * 4. Employer Share: 3.25% of Gross Salary
 * 5. Exemption: Employees with Average Daily Wage < ₹176 (changed from 137 recently, verified 176 w.e.f 2019)
 * 
 */

export interface ESICalculationResult {
    isEligible: boolean;
    esiWages: number;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
}

export class ESICalculator {
    private static readonly WAGE_LIMIT = 21000;
    private static readonly DISABILITY_WAGE_LIMIT = 25000;
    private static readonly MIN_DAILY_WAGE_FOR_CONTRIBUTION = 176;

    private static readonly EMPLOYEE_RATE = 0.0075; // 0.75%
    private static readonly EMPLOYER_RATE = 0.0325; // 3.25%

    /**
     * Calculate ESI
     * @param grossSalary Current month gross salary
     * @param daysWorked Number of days worked (for daily wage calc)
     * @param isDisability Whether employee has disability
     * @param forceEligibility If employee was eligible at start of contribution period, they remain eligible
     */
    static calculate(
        grossSalary: number,
        daysWorked: number,
        isDisability: boolean = false,
        forceEligibility: boolean = false
    ): ESICalculationResult {
        const limit = isDisability ? this.DISABILITY_WAGE_LIMIT : this.WAGE_LIMIT;

        let isEligible = forceEligibility || (grossSalary <= limit);

        // If not eligible, return 0
        if (!isEligible) {
            return {
                isEligible: false,
                esiWages: 0,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0
            };
        }

        // Check daily wage exemption
        // Average Daily Wages = Wages / Number of days in wage period (assuming month here)
        // If calculation is based on worked days:
        const dailyWage = daysWorked > 0 ? grossSalary / daysWorked : 0;
        const isExemptFromEmployeeShare = dailyWage < this.MIN_DAILY_WAGE_FOR_CONTRIBUTION;

        // Calculate Contributions
        // Rule: Rounded to NEXT higher rupee (ceil)
        let employeeContribution = 0;
        if (!isExemptFromEmployeeShare) {
            employeeContribution = Math.ceil(grossSalary * this.EMPLOYEE_RATE);
        }

        const employerContribution = Math.ceil(grossSalary * this.EMPLOYER_RATE);

        return {
            isEligible: true,
            esiWages: grossSalary,
            employeeContribution,
            employerContribution,
            totalContribution: employeeContribution + employerContribution
        };
    }
}
