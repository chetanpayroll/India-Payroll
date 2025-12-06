/**
 * GRATUITY CALCULATOR
 * Payment of Gratuity Act, 1972
 * 
 * FORMULA:
 * Gratuity = (Last drawn salary × 15 days × Years of service) / 26
 */

export interface GratuityCalculationInput {
    dateOfJoining: Date;
    dateOfLeaving: Date;
    lastBasicSalary: number;
    lastDA: number;  // Dearness Allowance
    reasonForLeaving: 'Resignation' | 'Retirement' | 'Death' | 'Disability' | 'Termination';
    employeeType: 'Monthly' | 'Daily' | 'Seasonal';
}

export interface GratuityCalculationResult {
    eligible: boolean;
    reason?: string;

    // Service details
    totalYears: number;
    totalMonths: number;
    totalDays: number;
    serviceYearsForCalculation: number;

    // Salary components
    basic: number;
    da: number;
    lastDrawnSalary: number;

    // Calculation
    gratuityAmount: number;
    cappedAmount: number;  // After applying ₹20L cap
    taxableAmount: number;

    // Metadata
    calculatedAt: Date;
    legalReference: string;
}

export class GratuityCalculator {

    private static readonly MAXIMUM_GRATUITY = 2000000;  // ₹20,00,000
    private static readonly DAYS_PER_YEAR = 15;
    private static readonly WORKING_DAYS_PER_MONTH = 26;
    private static readonly MINIMUM_SERVICE_YEARS = 5;

    /**
     * Calculate gratuity for an employee
     */
    static calculate(input: GratuityCalculationInput): GratuityCalculationResult {

        // Calculate service period
        const servicePeriod = this.calculateServicePeriod(
            input.dateOfJoining,
            input.dateOfLeaving
        );

        // Check eligibility
        const eligibility = this.checkEligibility(
            servicePeriod.years,
            servicePeriod.months,
            input.reasonForLeaving
        );

        if (!eligibility.eligible) {
            return {
                eligible: false,
                reason: eligibility.reason,
                totalYears: servicePeriod.years,
                totalMonths: servicePeriod.months,
                totalDays: servicePeriod.days,
                serviceYearsForCalculation: 0,
                basic: input.lastBasicSalary,
                da: input.lastDA,
                lastDrawnSalary: input.lastBasicSalary + input.lastDA,
                gratuityAmount: 0,
                cappedAmount: 0,
                taxableAmount: 0,
                calculatedAt: new Date(),
                legalReference: 'Payment of Gratuity Act, 1972'
            };
        }

        // Calculate service years for gratuity
        // Round part years: >= 6 months = 1 year, < 6 months = 0
        const serviceYears = servicePeriod.years +
            (servicePeriod.months >= 6 ? 1 : 0);

        // Calculate last drawn salary
        const lastDrawnSalary = input.lastBasicSalary + input.lastDA;

        // Calculate gratuity
        const gratuityAmount = this.calculateGratuityAmount(
            lastDrawnSalary,
            serviceYears,
            input.employeeType
        );

        // Apply maximum cap
        const cappedAmount = Math.min(gratuityAmount, this.MAXIMUM_GRATUITY);

        // Calculate taxable amount
        // Exemption: Lower of (a) Actual gratuity, (b) ₹20L, (c) Formula-based
        // Formula exemption = ₹10/working day × completed years × average salary of last 10 months
        const taxableAmount = this.calculateTaxableAmount(
            cappedAmount,
            serviceYears,
            lastDrawnSalary
        );

        return {
            eligible: true,
            totalYears: servicePeriod.years,
            totalMonths: servicePeriod.months,
            totalDays: servicePeriod.days,
            serviceYearsForCalculation: serviceYears,
            basic: input.lastBasicSalary,
            da: input.lastDA,
            lastDrawnSalary,
            gratuityAmount,
            cappedAmount,
            taxableAmount,
            calculatedAt: new Date(),
            legalReference: 'Payment of Gratuity Act, 1972'
        };
    }

    /**
     * Calculate precise service period
     */
    private static calculateServicePeriod(
        dateOfJoining: Date,
        dateOfLeaving: Date
    ): { years: number; months: number; days: number } {

        let years = dateOfLeaving.getFullYear() - dateOfJoining.getFullYear();
        let months = dateOfLeaving.getMonth() - dateOfJoining.getMonth();
        let days = dateOfLeaving.getDate() - dateOfJoining.getDate();

        // Adjust for negative days
        if (days < 0) {
            months--;
            const prevMonth = new Date(
                dateOfLeaving.getFullYear(),
                dateOfLeaving.getMonth(),
                0
            );
            days += prevMonth.getDate();
        }

        // Adjust for negative months
        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    }

    /**
     * Check gratuity eligibility
     */
    private static checkEligibility(
        years: number,
        months: number,
        reasonForLeaving: string
    ): { eligible: boolean; reason?: string } {

        // Exception: Death or disability - no minimum service
        if (reasonForLeaving === 'Death' || reasonForLeaving === 'Disability') {
            return { eligible: true };
        }

        // Standard case: 5 years minimum
        // 4 years 240 days is considered as 5 years
        const totalMonths = (years * 12) + months;
        const requiredMonths = (this.MINIMUM_SERVICE_YEARS * 12) - 4; // 56 months

        if (totalMonths < requiredMonths) {
            return {
                eligible: false,
                reason: `Minimum service of 5 years required. Employee has ${years} years ${months} months.`
            };
        }

        return { eligible: true };
    }

    /**
     * Calculate gratuity amount
     */
    private static calculateGratuityAmount(
        lastDrawnSalary: number,
        serviceYears: number,
        employeeType: string
    ): number {

        if (employeeType === 'Monthly') {
            // Formula: (Salary × 15 days × Years) / 26
            return (lastDrawnSalary * this.DAYS_PER_YEAR * serviceYears) /
                this.WORKING_DAYS_PER_MONTH;
        } else {
            // For daily/seasonal workers: (Salary × 7 days × Years) / 26
            return (lastDrawnSalary * 7 * serviceYears) /
                this.WORKING_DAYS_PER_MONTH;
        }
    }

    /**
     * Calculate taxable portion
     */
    private static calculateTaxableAmount(
        gratuityAmount: number,
        serviceYears: number,
        averageSalary: number
    ): number {

        // Tax exemption limit for non-government employees
        // 15 days salary for each completed year (based on last 10 months average)
        const exemptionLimit = (averageSalary * 15 * serviceYears) / 26;
        const statutoryLimit = this.MAXIMUM_GRATUITY;

        // Exempt amount = Minimum of (actual, ₹20L, formula)
        const exemptAmount = Math.min(
            gratuityAmount,
            statutoryLimit,
            exemptionLimit
        );

        // Taxable = Actual - Exempt
        return Math.max(0, gratuityAmount - exemptAmount);
    }
}
