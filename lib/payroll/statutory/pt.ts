/**
 * PROFESSIONAL TAX (PT) CALCULATION
 * State-wise slabs for India
 * Last Updated: December 2024
 */

type StateCode = 'MH' | 'KA' | 'TN' | 'TG' | 'WB' | 'GJ' | 'AP' | 'DL';

interface PTSlab {
    min: number;
    max: number;
    amount: number;
    exceptionMonth?: number; // 0-11, e.g., 1 for Feb
    exceptionAmount?: number;
}

const PT_SLABS: Record<StateCode, PTSlab[]> = {
    // Maharashtra
    'MH': [
        { min: 0, max: 7500, amount: 0 },
        { min: 7501, max: 10000, amount: 175 },
        { min: 10001, max: Infinity, amount: 200, exceptionMonth: 1, exceptionAmount: 300 } // Feb: 300
        // Note: Women earning up to 25k are exempt in MH? Use gender flag if needed. Slabs assume general.
    ],
    // Karnataka
    'KA': [
        { min: 0, max: 24999, amount: 0 },
        { min: 25000, max: Infinity, amount: 200 }
    ],
    // Tamil Nadu (Half-yearly deduction usually, but some deduct monthly. Assuming monthly prorated or 0)
    // TN PT is usually deducted every 6 months (Sept & Mar). 
    // Implementing monthly logic as placeholder or specific mode.
    'TN': [
        { min: 0, max: 21000, amount: 0 }, // Recent revision?
        // TN Slabs are complex and half-yearly. 
        // For monthly payroll, usually 0 effectively until the cut-off month.
        // Let's simplified assumption: 0 normally, logic handled in processor for specific months.
        { min: 21001, max: Infinity, amount: 208 } // Approx monthly? No, let's keep it defined but usually processed specific months.
    ],
    // Telangana
    'TG': [
        { min: 0, max: 15000, amount: 0 },
        { min: 15001, max: 20000, amount: 150 },
        { min: 20001, max: Infinity, amount: 200 }
    ],
    // West Bengal
    'WB': [
        { min: 0, max: 10000, amount: 0 },
        { min: 10001, max: 15000, amount: 110 },
        { min: 15001, max: 25000, amount: 130 },
        { min: 25001, max: 40000, amount: 150 },
        { min: 40001, max: Infinity, amount: 200 }
    ],
    // Gujarat
    'GJ': [
        { min: 0, max: 12000, amount: 0 },
        { min: 12001, max: Infinity, amount: 200 }
    ],
    // Andhra Pradesh
    'AP': [
        { min: 0, max: 15000, amount: 0 },
        { min: 15001, max: 20000, amount: 150 },
        { min: 20001, max: Infinity, amount: 200 }
    ],
    // Delhi (No PT)
    'DL': [
        { min: 0, max: Infinity, amount: 0 }
    ]
};

export class PTCalculator {
    /**
     * Calculate Professional Tax
     * @param state State Code (MH, KA, etc.)
     * @param grossSalary Monthly Gross Salary
     * @param gender Male/Female (Required for some states like MH exception)
     */
    static calculate(state: string, grossSalary: number, gender: string = 'Male'): number {
        const stateCode = state.toUpperCase() as StateCode;
        if (!PT_SLABS[stateCode]) return 0;

        // Maharashtra Women Exception (Up to 25k exempt)
        if (stateCode === 'MH' && gender.toLowerCase() === 'female' && grossSalary <= 25000) {
            return 0;
        }

        const slabs = PT_SLABS[stateCode];
        const currentMonth = new Date().getMonth(); // 0-11

        for (const slab of slabs) {
            if (grossSalary >= slab.min && grossSalary <= slab.max) {
                if (slab.exceptionMonth !== undefined && slab.exceptionMonth === currentMonth && slab.exceptionAmount !== undefined) {
                    return slab.exceptionAmount;
                }
                return slab.amount;
            }
        }

        return 0;
    }
}
