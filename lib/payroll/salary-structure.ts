/**
 * SALARY STRUCTURE CALCULATOR
 * Reverse calculates components from CTC
 */

import { PFCalculator } from './statutory/pf';
import { ESICalculator } from './statutory/esi';

export interface SalaryComponent {
    name: string;
    amount: number;
    isDeduction: boolean;
}

export interface StructureResult {
    ctc: number;
    monthlyGross: number;
    components: {
        basic: number;
        hra: number;
        special?: number;
        conveyance?: number;
        medical?: number;
    };
    deductions: {
        pfEmployer: number;
        esiEmployer: number;
        gratuity?: number;
        pfEmployee: number;
        esiEmployee: number;
        pt: number;
        tds: number;
    };
    netPay: number;
}

export class SalaryStructureService {

    /**
     * Calculate Structure from CTC
     * @param annualCTC Annual Cost to Company
     * @param options Configuration options
     */
    static calculateStructure(annualCTC: number, options?: {
        metroCity?: boolean;
        pfApplicable?: boolean;
        esiApplicable?: boolean;
    }): StructureResult {
        const monthlyCTC = annualCTC / 12;

        // 1. Basic (Assuming 50% of CTC or Minimum Wage)
        const basic = Math.round(monthlyCTC * 0.50);

        // 2. HRA (50% of Basic for Metro, 40% Non-Metro)
        const hraRate = options?.metroCity ? 0.50 : 0.40;
        const hra = Math.round(basic * hraRate);

        // 3. Allowances (Fixed logic for simple generation)
        const medical = 1250; // Fixed 15k/year usually
        const conveyance = 1600; // Old standard, now part of SD but still used for structure

        // 4. Statutory Employer Contributions (Part of CTC)
        // PF Employer (13% of Basic approx incl admin)
        // Correct logic: 12% of Basic (capped at 15k) + Admin charges
        const pfResult = PFCalculator.calculate(basic);
        const pfEmployer = pfResult.totalEmployerContribution;
        const pfEmployee = pfResult.employeeContribution;

        // ESI Employer (3.25% of Gross) - Circular dependency as Gross depends on Special Allowance which depends on CTC - Statutory
        // Simplified: Estimate Gross approx CTC - PF_Employer - Gratuity
        // Iterative approach or algebra needed for exact ESI. 
        // For 'Generation' we assume ESI is calculated on final Gross.

        // Let's assume Special Allowance balances the CTC
        // Gross = Basic + HRA + Allowances + Special
        // CTC = Gross + PF_Employer + ESI_Employer + Gratuity

        // Gratuity (4.81% of Basic)
        const gratuity = Math.round(basic * 4.81 / 100);

        // Residual for Special Allowance
        // Special = CTC - (Basic + HRA + Conveyance + Medical + PF_Employer + Gratuity + ESI_Employer)
        // ESI is non-linear. Let's ignore ESI Employer in initial balance for simplicity or check eligibility.

        let special = monthlyCTC - (basic + hra + conveyance + medical + pfEmployer + gratuity);
        if (special < 0) special = 0; // Should not happen for healthy CTC

        let monthlyGross = basic + hra + conveyance + medical + special;

        // ESI Check
        let esiEmployer = 0;
        let esiEmployee = 0;
        const esiCalc = ESICalculator.calculate(monthlyGross, 30); // 30 days default
        if (esiCalc.isEligible) {
            esiEmployer = esiCalc.employerContribution;
            esiEmployee = esiCalc.employeeContribution;

            // Re-adjust Special to absorb ESI cost if CTC is strict?
            // "Cost to Company" usually includes ESI Employer share.
            // So if ESI applies, we reduce special allowance.
            special = special - esiEmployer;
            if (special < 0) special = 0;

            monthlyGross = basic + hra + conveyance + medical + special;
            // ESI might change slightly but negligible diff for this generator
        }

        // PT Estimate (MH default)
        const pt = monthlyGross > 10000 ? 200 : 0;

        // TDS Estimate (Zero for structure generation usually)
        const tds = 0;

        const totalDeductions = pfEmployee + esiEmployee + pt + tds;
        const netPay = monthlyGross - totalDeductions;

        return {
            ctc: annualCTC,
            monthlyGross,
            components: {
                basic,
                hra,
                conveyance,
                medical,
                special
            },
            deductions: {
                pfEmployer,
                esiEmployer,
                gratuity,
                pfEmployee,
                esiEmployee,
                pt,
                tds
            },
            netPay
        };
    }
}
