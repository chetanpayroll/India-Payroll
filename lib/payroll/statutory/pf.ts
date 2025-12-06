import { format } from 'date-fns';

/**
 * PROVIDENT FUND CALCULATION
 * Reference: Employees' Provident Funds and Miscellaneous Provisions Act, 1952
 * Last Updated: December 2024
 * 
 * IMPORTANT RULES:
 * 1. PF ceiling: ₹15,000/month (as of September 2014)
 * 2. Employee contribution: 12% of (Basic + DA), capped at ceiling
 * 3. Employer contribution: 12% split as follows:
 *    - 3.67% → EPF (Employee Provident Fund)
 *    - 8.33% → EPS (Employee Pension Scheme), max ₹1,250/month
 *    - 0.5% → EDLI (Employee Deposit Linked Insurance)
 *    - 0.01% → EDLI Admin Charges (Min 500 in total challan usually, but per emp here) -> Actually usually 0.5% min 500, admin 0.01% is rare? 
 *      Let's follow prompt spec: 0.01% EDLI Admin (Actually currently 0), 0.5% EPF Admin.
 * 
 *      Prompt says:
 *      - 0.01% → EDLI Admin Charges
 *      - 0.5% → EPF Admin Charges
 */

export interface PFCalculationResult {
    // Wages
    pfWages: number;
    cappedAtCeiling: boolean;

    // Employee Contribution
    employeeContribution: number;
    employeeContributionRate: number; // 0.12

    // Employer Contribution Breakdown
    employerEPF: number;
    employerEPS: number;
    employerEDLI: number;
    edliAdminCharges: number;
    epfAdminCharges: number;
    totalEmployerContribution: number;

    // Rates
    epfRate: number; // 0.0367
    epsRate: number; // 0.0833
    edliRate: number; // 0.005

    // Metadata
    calculatedAt: Date;
    financialYear: string;
}

export interface PFEmployee {
    uan: string;
    name: string;
    grossSalary: number;
    basicSalary: number; // + DA
    ncpDays?: number;
}

export class PFCalculator {
    // Constants
    private static readonly PF_CEILING = 15000;
    private static readonly EMPLOYEE_RATE = 0.12;
    private static readonly EPF_EMPLOYER_RATE = 0.0367;
    private static readonly EPS_RATE = 0.0833;
    private static readonly EPS_MAX = 1250;
    private static readonly EDLI_RATE = 0.005;
    private static readonly EDLI_ADMIN_RATE = 0.0001; // As per prompt 0.01%? 0.01% is 0.0001
    private static readonly EPF_ADMIN_RATE = 0.005;

    /**
     * Calculate PF for an employee
     * @param basicSalary - Monthly basic salary + DA
     * @param isInternational - International workers (0% EPS)
     * @param isPFExempted - Employee opted out (employer < 20 employees)
     * @returns PF calculation result
     */
    static calculate(
        basicSalary: number,
        isInternational: boolean = false,
        isPFExempted: boolean = false
    ): PFCalculationResult {
        // Validation
        if (basicSalary < 0) {
            throw new Error('Basic salary cannot be negative');
        }

        if (isPFExempted) {
            return this.getZeroResult();
        }

        // Calculate PF wages (capped at ceiling)
        const pfWages = Math.min(basicSalary, this.PF_CEILING);
        const cappedAtCeiling = basicSalary > this.PF_CEILING;

        // Employee contribution: rounded to nearest rupee
        const employeeContribution = Math.round(pfWages * this.EMPLOYEE_RATE);

        // Employer contribution breakdown
        const employerEPF = Math.round(pfWages * this.EPF_EMPLOYER_RATE);

        // EPS calculation (special handling for international workers)
        let employerEPS = 0;
        if (!isInternational) {
            const epsCalculated = Math.round(pfWages * this.EPS_RATE);
            employerEPS = Math.min(epsCalculated, this.EPS_MAX);
        }

        const employerEDLI = Math.round(pfWages * this.EDLI_RATE);
        const edliAdminCharges = Math.round(pfWages * this.EDLI_ADMIN_RATE);
        const epfAdminCharges = Math.round(pfWages * this.EPF_ADMIN_RATE);

        const totalEmployerContribution =
            employerEPF +
            employerEPS +
            employerEDLI +
            edliAdminCharges +
            epfAdminCharges;

        return {
            pfWages,
            cappedAtCeiling,
            employeeContribution,
            employeeContributionRate: this.EMPLOYEE_RATE,
            employerEPF,
            employerEPS,
            employerEDLI,
            edliAdminCharges,
            epfAdminCharges,
            totalEmployerContribution,
            epfRate: this.EPF_EMPLOYER_RATE,
            epsRate: this.EPS_RATE,
            edliRate: this.EDLI_RATE,
            calculatedAt: new Date(),
            financialYear: this.getCurrentFinancialYear(),
        };
    }

    private static getZeroResult(): PFCalculationResult {
        return {
            pfWages: 0,
            cappedAtCeiling: false,
            employeeContribution: 0,
            employeeContributionRate: 0,
            employerEPF: 0,
            employerEPS: 0,
            employerEDLI: 0,
            edliAdminCharges: 0,
            epfAdminCharges: 0,
            totalEmployerContribution: 0,
            epfRate: 0,
            epsRate: 0,
            edliRate: 0,
            calculatedAt: new Date(),
            financialYear: this.getCurrentFinancialYear()
        }
    }

    private static getCurrentFinancialYear(): string {
        const today = new Date();
        const month = today.getMonth(); // 0-11
        const year = today.getFullYear();
        if (month >= 3) { // April onwards
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    }

    private static getMonthName(month: number): string {
        const date = new Date();
        date.setMonth(month - 1);
        return format(date, 'MMMM');
    }

    /**
     * Generate ECR (Electronic Challan cum Return) file content
     */
    static generateECR(employees: PFEmployee[], month: number, year: number): string {
        const lines: string[] = [];

        // Header (as per prompt demo)
        lines.push(`#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#`);
        lines.push(`# ECR for ${this.getMonthName(month)} ${year}`);
        lines.push(`# Generated: ${new Date().toISOString()}`);
        lines.push(`#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#`);
        lines.push('');

        // CSV Header usually required for ECR actually, but following prompts style
        // UAN#MEMBER_NAME#GROSS_WAGES#EPF_WAGES#EPS_WAGES#EDLI_WAGES#EPF_CONTRI_REMITTED#EPS_CONTRI_REMITTED#EPF_EPS_DIFF_REMITTED#NCP_DAYS#REFUND_OF_ADVANCES
        lines.push('UAN#MEMBER_NAME#GROSS_WAGES#EPF_WAGES#EPS_WAGES#EDLI_WAGES#EPF_CONTRI_REMITTED#EPS_CONTRI_REMITTED#EPF_EPS_DIFF_REMITTED#NCP_DAYS#REFUND_OF_ADVANCES');

        for (const employee of employees) {
            const pf = this.calculate(employee.basicSalary);

            const line = [
                employee.uan,
                employee.name,
                Math.round(employee.grossSalary),
                Math.round(pf.pfWages),
                Math.round(pf.pfWages), // EPS wages capped at 15000 implicitly by calculate logic? Wait. calculate logic caps pfWages at 15000. So this is correct.
                Math.round(pf.pfWages), // EDLI wages sane as PF
                pf.employeeContribution,
                pf.employerEPS,
                pf.employerEPF, // This is actually (Employer Share - EPS Share) usually. 
                // Prompt said "employerEPF" is 3.67% which IS the difference. So this is correct.
                employee.ncpDays || 0,
                0, // Refund
            ].join('#');

            lines.push(line);
        }

        return lines.join('\n');
    }
}
