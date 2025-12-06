/**
 * LABOUR WELFARE FUND (LWF) CALCULATOR
 * 
 * State-wise contribution rules
 * Updated: December 2024
 */

export interface LWFConfig {
    state: string;
    employeeContribution: number;
    employerContribution: number;
    deductionMonths: number[];  // [6] for June, [6, 12] for June & December
    wageceiling?: number;       // If applicable
    minimumWage?: number;       // Minimum wage for applicability
    effectiveFrom?: Date;
}

export interface LWFCalculationResult {
    applicable: boolean;
    state: string;
    month: number;
    deductionMonth: boolean;

    // Contributions
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;

    // Metadata
    reason?: string;  // If not applicable
    calculatedAt: Date;
}

export class LWFCalculator {

    /**
     * State-wise LWF configurations (as of December 2024)
     */
    private static readonly LWF_CONFIGS: Record<string, LWFConfig> = {
        // Kerala
        'Kerala': {
            state: 'Kerala',
            employeeContribution: 20,
            employerContribution: 40,
            deductionMonths: [6, 12],  // June and December
            effectiveFrom: new Date('2018-01-01')
        },

        // Tamil Nadu
        'Tamil Nadu': {
            state: 'Tamil Nadu',
            employeeContribution: 20,
            employerContribution: 40,
            deductionMonths: [6],  // June only
            effectiveFrom: new Date('2015-01-01')
        },

        // Andhra Pradesh
        'Andhra Pradesh': {
            state: 'Andhra Pradesh',
            employeeContribution: 10,
            employerContribution: 20,
            deductionMonths: [6],  // June only
            minimumWage: 3000,
            effectiveFrom: new Date('2016-01-01')
        },

        // Telangana
        'Telangana': {
            state: 'Telangana',
            employeeContribution: 10,
            employerContribution: 20,
            deductionMonths: [6],  // June only
            minimumWage: 3000,
            effectiveFrom: new Date('2014-06-01')
        },

        // Karnataka
        'Karnataka': {
            state: 'Karnataka',
            employeeContribution: 20,
            employerContribution: 40,
            deductionMonths: [6],  // June only (Assuming annual for generated code simplicity, verifying real rule: usually Dec? Code says June. Sticking to prompt.)
            wageceiling: 6000,  // Note: 6000 ceiling implies it only applies to low earners? Need to verify logic. Prompt says so.
            effectiveFrom: new Date('2015-01-01')
        },

        // Maharashtra
        'Maharashtra': {
            state: 'Maharashtra',
            employeeContribution: 6, // June: 6, Dec: 12 usually? Prompt says 6 and 12 for both months?
            // Actually MH LWF is: June (6/18) and Dec (6/18)? Wait. 
            // Prompt config: employee 6, employer 12. Months: [6, 12]. OK.
            employerContribution: 12, // 3x of employee usually? 6*3=18? 
            // Prompt says: EE 6, ER 12. Let's trust prompt.
            deductionMonths: [6, 12],
            effectiveFrom: new Date('2017-01-01')
        },

        // Gujarat
        'Gujarat': {
            state: 'Gujarat',
            employeeContribution: 6,
            employerContribution: 12,
            deductionMonths: [6, 12],
            effectiveFrom: new Date('2018-01-01')
        },

        // Haryana - Monthly
        'Haryana': {
            state: 'Haryana',
            employeeContribution: 10, // Monthly usually? Prompt says [6].
            // Haryana LWF is usually monthly. But following prompt "June only" for generation consistency if that's what was asked.
            // Re-reading prompt: "deductionMonths: [6]" for Haryana. OK.
            employerContribution: 20,
            deductionMonths: [6],
            effectiveFrom: new Date('2016-01-01')
        },

        // West Bengal
        'West Bengal': {
            state: 'West Bengal',
            employeeContribution: 3,
            employerContribution: 15,
            deductionMonths: [6, 12],
            effectiveFrom: new Date('2016-01-01')
        }
    };

    /**
     * Calculate LWF for an employee
     */
    static calculate(
        state: string,
        monthlyGross: number,
        month: number,  // 1-12
        employmentType: 'Permanent' | 'Contract' | 'Intern' = 'Permanent'
    ): LWFCalculationResult {

        // Get state configuration
        const config = this.LWF_CONFIGS[state] || this.LWF_CONFIGS[state.replace('State', '').trim()]; // Try flexible match

        // If state doesn't have LWF in our config
        if (!config) {
            return {
                applicable: false,
                state,
                month,
                deductionMonth: false,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
                reason: `LWF not configured for ${state}`,
                calculatedAt: new Date()
            };
        }

        // Check if it's a deduction month
        const isDeductionMonth = config.deductionMonths.includes(month);

        if (!isDeductionMonth) {
            return {
                applicable: false,
                state,
                month,
                deductionMonth: false,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
                reason: `LWF deduction only in months: ${config.deductionMonths.join(', ')}`,
                calculatedAt: new Date()
            };
        }

        // Check wage ceiling (if applicable)
        // Note: Karnataka logic in prompt said "wageceiling: 6000". If gross > 6000, is it exempt? 
        // "Applicable if monthly wage <= ₹6,000" -> This usually implies it's for low income. 
        // Most LWF applies to everyone. BUT adhering to prompt logic.
        if (config.wageceiling && monthlyGross > config.wageceiling) {
            return {
                applicable: false,
                state,
                month,
                deductionMonth: true,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
                reason: `Monthly gross (₹${monthlyGross}) exceeds wage ceiling (₹${config.wageceiling})`,
                calculatedAt: new Date()
            };
        }

        // Check minimum wage (if applicable)
        if (config.minimumWage && monthlyGross < config.minimumWage) {
            return {
                applicable: false,
                state,
                month,
                deductionMonth: true,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
                reason: `Monthly gross (₹${monthlyGross}) below minimum wage (₹${config.minimumWage})`,
                calculatedAt: new Date()
            };
        }

        // Interns are typically exempt
        if (employmentType === 'Intern') {
            return {
                applicable: false,
                state,
                month,
                deductionMonth: true,
                employeeContribution: 0,
                employerContribution: 0,
                totalContribution: 0,
                reason: 'Interns are exempt from LWF',
                calculatedAt: new Date()
            };
        }

        // Calculate contributions
        const employeeContribution = config.employeeContribution;
        const employerContribution = config.employerContribution;
        const totalContribution = employeeContribution + employerContribution;

        return {
            applicable: true,
            state,
            month,
            deductionMonth: true,
            employeeContribution,
            employerContribution,
            totalContribution,
            calculatedAt: new Date()
        };
    }
}
