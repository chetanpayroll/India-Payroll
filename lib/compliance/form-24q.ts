/**
 * FORM 24Q - TDS QUARTERLY RETURN FOR SALARY
 * 
 * Income Tax Requirements:
 * - File format: FVU (File Validation Utility) format
 */

export interface Form24QDeductee {
    employeeId: string;
    pan: string;
    name: string;

    // Quarterly salary details
    salaryIncome: number;
    allowances: number;
    perquisites: number;
    profitsInLieuOfSalary: number;
    totalIncome: number;

    // Deductions
    deduction_80C: number;
    deduction_80D: number;
    deduction_80CCD1B: number;
    otherDeductions: number;

    // Tax calculation
    taxableIncome: number;
    tdsDeducted: number;

    // Challan reference
    challanSerialNumber?: string;
}

export interface Form24QChallan {
    bsrCode: string;
    dateOfDeposit: Date;
    challanSerialNumber: string;
    amount: number;
    interestPaid: number;
    fees: number;
}

export class Form24QGenerator {

    /**
     * Generate Form 24Q in FVU format
     */
    static generateFVU(
        quarter: number,  // 1, 2, 3, or 4
        financialYear: string,  // "2023-24"
        deductorDetails: {
            tan: string;
            name: string;
            pan: string;
            address: string;
            state: string;
            pincode: string;
        },
        deductees: Form24QDeductee[],
        challans: Form24QChallan[]
    ): string {

        const lines: string[] = [];

        // FILE HEADER (FH Record)
        lines.push(this.generateFileHeader(quarter, financialYear));

        // DEDUCTOR RECORD (DH Record)
        lines.push(this.generateDeductorRecord(deductorDetails, quarter, financialYear));

        // CHALLAN RECORDS (CH Records)
        for (const challan of challans) {
            lines.push(this.generateChallanRecord(challan, deductorDetails.tan));
        }

        // DEDUCTEE RECORDS (DD Records)
        for (let i = 0; i < deductees.length; i++) {
            lines.push(this.generateDeducteeRecord(deductees[i], i + 1));

            // SALARY DETAIL RECORD (SD Record)
            lines.push(this.generateSalaryDetailRecord(deductees[i]));
        }

        // BATCH TRAILER (BT Record)
        lines.push(this.generateBatchTrailer(deductees));

        // FILE TRAILER (FT Record)
        lines.push(this.generateFileTrailer(deductees, challans));

        return lines.join('\n');
    }

    private static generateFileHeader(quarter: number, fy: string): string {
        const batchNumber = '1';
        const preparerName = 'GMP PAYROLL';
        const preparerId = 'GMPSOFT001';

        return `FH<Q${quarter}><${fy}><${batchNumber}><${preparerName}><${preparerId}>`;
    }

    private static generateDeductorRecord(
        details: any,
        quarter: number,
        fy: string
    ): string {
        return `DH<${details.tan}><${details.pan}><${details.name}><${details.address}><${details.state}><${details.pincode}><Q${quarter}><${fy}>`;
    }

    private static generateChallanRecord(
        challan: Form24QChallan,
        tan: string
    ): string {
        const dateStr = challan.dateOfDeposit.toISOString().split('T')[0].replace(/-/g, '');

        return `CH<${tan}><${challan.bsrCode}><${dateStr}><${challan.challanSerialNumber}><${challan.amount}><${challan.interestPaid}><${challan.fees}>`;
    }

    private static generateDeducteeRecord(
        deductee: Form24QDeductee,
        serialNumber: number
    ): string {
        return `DD<${serialNumber}><${deductee.pan}><${deductee.name}><${deductee.totalIncome}><${deductee.tdsDeducted}>`;
    }

    private static generateSalaryDetailRecord(
        deductee: Form24QDeductee
    ): string {
        return `SD<${deductee.salaryIncome}><${deductee.allowances}><${deductee.perquisites}><${deductee.totalIncome}><${deductee.deduction_80C}><${deductee.deduction_80D}><${deductee.taxableIncome}><${deductee.tdsDeducted}>`;
    }

    private static generateBatchTrailer(deductees: Form24QDeductee[]): string {
        const totalDeductees = deductees.length;
        const totalTDS = deductees.reduce((sum, d) => sum + d.tdsDeducted, 0);

        return `BT<${totalDeductees}><${totalTDS}>`;
    }

    private static generateFileTrailer(
        deductees: Form24QDeductee[],
        challans: Form24QChallan[]
    ): string {
        const totalDeductees = deductees.length;
        const totalChallans = challans.length;
        const totalTDS = deductees.reduce((sum, d) => sum + d.tdsDeducted, 0);
        const totalDeposited = challans.reduce((sum, c) => sum + c.amount, 0);

        return `FT<${totalDeductees}><${totalChallans}><${totalTDS}><${totalDeposited}>`;
    }
}
