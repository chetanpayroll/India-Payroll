import { Injectable } from '@nestjs/common';

export interface ESIConfig {
    employee_rate: number;
    employer_rate: number;
    wage_ceiling: number;
}

export interface ESIResult {
    isApplicable: boolean;
    esiWage: number;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
}

@Injectable()
export class ESIService {
    private readonly DEFAULT_CONFIG: ESIConfig = {
        employee_rate: 0.0075,        // 0.75%
        employer_rate: 0.0325,        // 3.25%
        wage_ceiling: 21000,          // ₹21,000
    };

    /**
     * Calculate ESI contributions
     * 
     * @param grossSalary - Gross salary for the month
     * @param config - Custom ESI config (optional)
     * @param isEsiApplicable - Whether ESI is applicable for this employee
     * @returns ESI calculation result
     */
    calculate(
        grossSalary: number,
        config?: Partial<ESIConfig>,
        isEsiApplicable: boolean = true,
    ): ESIResult {
        const cfg = { ...this.DEFAULT_CONFIG, ...config };

        // ESI not applicable if opted out
        if (!isEsiApplicable) {
            return {
                isApplicable: false,
                esiWage: 0,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
            };
        }

        // ESI not applicable if gross > wage ceiling
        if (grossSalary > cfg.wage_ceiling) {
            return {
                isApplicable: false,
                esiWage: grossSalary,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
            };
        }

        // ESI wage is the gross salary (within ceiling)
        const esiWage = grossSalary;

        // Employee contribution: 0.75% of gross
        const employeeContribution = Math.round(esiWage * cfg.employee_rate);

        // Employer contribution: 3.25% of gross
        const employerContribution = Math.round(esiWage * cfg.employer_rate);

        // Total contribution
        const totalContribution = employeeContribution + employerContribution;

        return {
            isApplicable: true,
            esiWage,
            employeeContribution,
            employerContribution,
            totalContribution,
        };
    }

    /**
     * Check if employee is eligible for ESI
     */
    isEligible(grossSalary: number, isEsiApplicable: boolean = true): boolean {
        if (!isEsiApplicable) {
            return false;
        }

        // ESI is applicable only if gross <= ₹21,000
        return grossSalary <= this.DEFAULT_CONFIG.wage_ceiling;
    }

    /**
     * Calculate annual ESI summary
     */
    calculateAnnual(monthlyGross: number, months: number = 12): {
        totalEmployeeContribution: number;
        totalEmployerContribution: number;
        totalESI: number;
    } {
        const monthly = this.calculate(monthlyGross);

        return {
            totalEmployeeContribution: monthly.employeeContribution * months,
            totalEmployerContribution: monthly.employerContribution * months,
            totalESI: monthly.totalContribution * months,
        };
    }

    /**
     * Check if employee crossed ESI ceiling during the year
     * Once an employee's salary crosses ₹21,000, ESI is no longer deducted
     */
    checkCeilingBreach(currentGross: number, previousGross: number): boolean {
        const ceiling = this.DEFAULT_CONFIG.wage_ceiling;
        return previousGross <= ceiling && currentGross > ceiling;
    }
}
