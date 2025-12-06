import { Injectable } from '@nestjs/common';

export interface PTSlab {
    min: number;
    max: number | null;
    tax: number;
    febTax?: number; // Special for Maharashtra
}

export interface PTConfig {
    state: string;
    slabs: PTSlab[];
}

@Injectable()
export class PTService {
    /**
     * Professional Tax slabs for all Indian states
     */
    private readonly PT_CONFIGS: Record<string, PTConfig> = {
        // KARNATAKA
        KA: {
            state: 'Karnataka',
            slabs: [
                { min: 0, max: 15000, tax: 0 },
                { min: 15001, max: null, tax: 200 },
            ],
        },

        // MAHARASHTRA
        MH: {
            state: 'Maharashtra',
            slabs: [
                { min: 0, max: 7500, tax: 0 },
                { min: 7501, max: 10000, tax: 175 },
                { min: 10001, max: null, tax: 200, febTax: 300 },
            ],
        },

        // TAMIL NADU
        TN: {
            state: 'Tamil Nadu',
            slabs: [
                { min: 0, max: 21000, tax: 0 },
                { min: 21001, max: 30000, tax: 135 },
                { min: 30001, max: 45000, tax: 315 },
                { min: 45001, max: 60000, tax: 690 },
                { min: 60001, max: 75000, tax: 1025 },
                { min: 75001, max: null, tax: 1250 },
            ],
        },

        // TELANGANA
        TS: {
            state: 'Telangana',
            slabs: [
                { min: 0, max: 15000, tax: 0 },
                { min: 15001, max: 20000, tax: 150 },
                { min: 20001, max: null, tax: 200 },
            ],
        },

        // ANDHRA PRADESH
        AP: {
            state: 'Andhra Pradesh',
            slabs: [
                { min: 0, max: 15000, tax: 0 },
                { min: 15001, max: 20000, tax: 150 },
                { min: 20001, max: null, tax: 200 },
            ],
        },

        // WEST BENGAL
        WB: {
            state: 'West Bengal',
            slabs: [
                { min: 0, max: 10000, tax: 0 },
                { min: 10001, max: 15000, tax: 110 },
                { min: 15001, max: 25000, tax: 130 },
                { min: 25001, max: 40000, tax: 150 },
                { min: 40001, max: null, tax: 200 },
            ],
        },

        // GUJARAT
        GJ: {
            state: 'Gujarat',
            slabs: [
                { min: 0, max: 5999, tax: 0 },
                { min: 6000, max: 8999, tax: 80 },
                { min: 9000, max: 11999, tax: 150 },
                { min: 12000, max: null, tax: 200 },
            ],
        },

        // MADHYA PRADESH
        MP: {
            state: 'Madhya Pradesh',
            slabs: [
                { min: 0, max: 15000, tax: 0 },
                { min: 15001, max: null, tax: 208.33 }, // Annual ₹2,500 / 12
            ],
        },

        // ODISHA
        OD: {
            state: 'Odisha',
            slabs: [
                { min: 0, max: 10000, tax: 0 },
                { min: 10001, max: 15000, tax: 100 },
                { min: 15001, max: 20000, tax: 150 },
                { min: 20001, max: null, tax: 200 },
            ],
        },

        // ASSAM
        AS: {
            state: 'Assam',
            slabs: [
                { min: 0, max: 10000, tax: 0 },
                { min: 10001, max: 15000, tax: 150 },
                { min: 15001, max: 25000, tax: 180 },
                { min: 25001, max: null, tax: 208 },
            ],
        },

        // CHHATTISGARH
        CG: {
            state: 'Chhattisgarh',
            slabs: [
                { min: 0, max: 12500, tax: 0 },
                { min: 12501, max: 16666, tax: 125 },
                { min: 16667, max: 20833, tax: 150 },
                { min: 20834, max: null, tax: 187.50 },
            ],
        },

        // JHARKHAND
        JH: {
            state: 'Jharkhand',
            slabs: [
                { min: 0, max: 15000, tax: 0 },
                { min: 15001, max: 25000, tax: 150 },
                { min: 25001, max: null, tax: 200 },
            ],
        },

        // SIKKIM
        SK: {
            state: 'Sikkim',
            slabs: [
                { min: 0, max: 20000, tax: 0 },
                { min: 20001, max: 30000, tax: 100 },
                { min: 30001, max: 40000, tax: 150 },
                { min: 40001, max: null, tax: 200 },
            ],
        },

        // MEGHALAYA
        ML: {
            state: 'Meghalaya',
            slabs: [
                { min: 0, max: 8333, tax: 0 },
                { min: 8334, max: 16666, tax: 83.33 },
                { min: 16667, max: null, tax: 166.66 },
            ],
        },

        // TRIPURA
        TR: {
            state: 'Tripura',
            slabs: [
                { min: 0, max: 5000, tax: 0 },
                { min: 5001, max: 7000, tax: 40 },
                { min: 7001, max: 9000, tax: 70 },
                { min: 9001, max: null, tax: 150 },
            ],
        },

        // NO PT STATES
        DL: { state: 'Delhi', slabs: [{ min: 0, max: null, tax: 0 }] },
        HR: { state: 'Haryana', slabs: [{ min: 0, max: null, tax: 0 }] },
        HP: { state: 'Himachal Pradesh', slabs: [{ min: 0, max: null, tax: 0 }] },
        JK: { state: 'Jammu & Kashmir', slabs: [{ min: 0, max: null, tax: 0 }] },
        KL: { state: 'Kerala', slabs: [{ min: 0, max: null, tax: 0 }] },
        BR: { state: 'Bihar', slabs: [{ min: 0, max: null, tax: 0 }] },
        UP: { state: 'Uttar Pradesh', slabs: [{ min: 0, max: null, tax: 0 }] },
        RJ: { state: 'Rajasthan', slabs: [{ min: 0, max: null, tax: 0 }] },
        PB: { state: 'Punjab', slabs: [{ min: 0, max: null, tax: 0 }] },
        UT: { state: 'Uttarakhand', slabs: [{ min: 0, max: null, tax: 0 }] },
        GA: { state: 'Goa', slabs: [{ min: 0, max: null, tax: 0 }] },
        MN: { state: 'Manipur', slabs: [{ min: 0, max: null, tax: 0 }] },
        MZ: { state: 'Mizoram', slabs: [{ min: 0, max: null, tax: 0 }] },
        NL: { state: 'Nagaland', slabs: [{ min: 0, max: null, tax: 0 }] },
        AR: { state: 'Arunachal Pradesh', slabs: [{ min: 0, max: null, tax: 0 }] },
    };

    /**
     * Calculate Professional Tax
     * 
     * @param grossSalary - Gross salary for the month
     * @param stateCode - State code (e.g., 'MH', 'KA', 'TN')
     * @param month - Month number (1-12), relevant for Maharashtra February PT
     * @param isPtApplicable - Whether PT is applicable for this employee
     * @returns PT amount
     */
    calculate(
        grossSalary: number,
        stateCode: string,
        month?: number,
        isPtApplicable: boolean = true,
    ): number {
        if (!isPtApplicable) {
            return 0;
        }

        const config = this.PT_CONFIGS[stateCode.toUpperCase()] || this.PT_CONFIGS.DL;
        const slab = config.slabs.find(
            (s) => grossSalary >= s.min && (s.max === null || grossSalary <= s.max),
        );

        if (!slab) {
            return 0;
        }

        // Maharashtra special case: February PT is ₹300
        if (stateCode.toUpperCase() === 'MH' && month === 2 && slab.febTax) {
            return slab.febTax;
        }

        return slab.tax;
    }

    /**
     * Calculate annual PT
     */
    calculateAnnual(
        monthlyGross: number,
        stateCode: string,
        isPtApplicable: boolean = true,
    ): number {
        if (!isPtApplicable) {
            return 0;
        }

        let total = 0;

        // Calculate for each month (Maharashtra has different PT in February)
        for (let month = 1; month <= 12; month++) {
            total += this.calculate(monthlyGross, stateCode, month, isPtApplicable);
        }

        return total;
    }

    /**
     * Get PT config for a state
     */
    getConfig(stateCode: string): PTConfig | undefined {
        return this.PT_CONFIGS[stateCode.toUpperCase()];
    }

    /**
     * Get all state codes with PT
     */
    getStatesWithPT(): string[] {
        return Object.keys(this.PT_CONFIGS).filter(
            (code) => this.PT_CONFIGS[code].slabs.some((s) => s.tax > 0),
        );
    }

    /**
     * Check if state has PT
     */
    hasPT(stateCode: string): boolean {
        const config = this.PT_CONFIGS[stateCode.toUpperCase()];
        if (!config) return false;
        return config.slabs.some((s) => s.tax > 0);
    }
}
