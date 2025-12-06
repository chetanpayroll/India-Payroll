import { Injectable } from '@nestjs/common';

export interface EPFConfig {
    employee_rate: number;
    employer_rate: number;
    eps_rate: number;
    epf_rate: number;
    wage_ceiling: number;
    admin_rate: number;
    edli_rate: number;
    edli_admin_rate: number;
}

export interface EPFResult {
    pfWage: number;
    employeeContribution: number;
    employerEPFContribution: number;
    employerEPSContribution: number;
    employerTotalContribution: number;
    adminCharges: number;
    edliContribution: number;
    edliAdminCharges: number;
    totalEmployerCost: number;
}

@Injectable()
export class EPFService {
    private readonly DEFAULT_CONFIG: EPFConfig = {
        employee_rate: 0.12,          // 12%
        employer_rate: 0.12,          // 12%
        eps_rate: 0.0833,             // 8.33%
        epf_rate: 0.0367,             // 3.67% (12% - 8.33%)
        wage_ceiling: 15000,          // ₹15,000
        admin_rate: 0.005,            // 0.50%
        edli_rate: 0.005,             // 0.50%
        edli_admin_rate: 0.0001,      // 0.01%
    };

    /**
     * Calculate EPF contributions
     * 
     * @param basicPlusDa - Basic + DA (or PF wage)
     * @param config - Custom EPF config (optional)
     * @returns EPF calculation result
     */
    calculate(basicPlusDa: number, config?: Partial<EPFConfig>): EPFResult {
        const cfg = { ...this.DEFAULT_CONFIG, ...config };

        // Apply wage ceiling
        const pfWage = Math.min(basicPlusDa, cfg.wage_ceiling);

        // Employee contribution: 12% of PF wage
        const employeeContribution = Math.round(pfWage * cfg.employee_rate);

        // Employer contribution split:
        // - EPS: 8.33% of min(basic+DA, 15000)
        // - EPF: 3.67% (12% - 8.33%)
        const employerEPSContribution = Math.round(pfWage * cfg.eps_rate);
        const employerEPFContribution = Math.round(pfWage * cfg.epf_rate);
        const employerTotalContribution = employerEPSContribution + employerEPFContribution;

        // Admin charges: 0.50% of PF wage
        const adminCharges = Math.round(pfWage * cfg.admin_rate);

        // EDLI: 0.50% of PF wage
        const edliContribution = Math.round(pfWage * cfg.edli_rate);

        // EDLI admin charges: 0.01% of PF wage
        const edliAdminCharges = Math.round(pfWage * cfg.edli_admin_rate);

        // Total employer cost
        const totalEmployerCost =
            employerTotalContribution +
            adminCharges +
            edliContribution +
            edliAdminCharges;

        return {
            pfWage,
            employeeContribution,
            employerEPFContribution,
            employerEPSContribution,
            employerTotalContribution,
            adminCharges,
            edliContribution,
            edliAdminCharges,
            totalEmployerCost,
        };
    }

    /**
     * Check if employee is eligible for EPF
     */
    isEligible(grossSalary: number, isPfOptedOut: boolean = false): boolean {
        if (isPfOptedOut) {
            return false;
        }

        // EPF is mandatory for employees earning <= ₹15,000 basic
        // Optional for employees earning > ₹15,000 basic
        // For this implementation, we'll consider all as eligible unless opted out
        return true;
    }

    /**
     * Calculate annual EPF summary
     */
    calculateAnnual(monthlyBasicPlusDa: number, months: number = 12): {
        totalEmployeeContribution: number;
        totalEmployerContribution: number;
        totalEPF: number;
    } {
        const monthly = this.calculate(monthlyBasicPlusDa);

        return {
            totalEmployeeContribution: monthly.employeeContribution * months,
            totalEmployerContribution: monthly.employerTotalContribution * months,
            totalEPF: (monthly.employeeContribution + monthly.employerTotalContribution) * months,
        };
    }
}
