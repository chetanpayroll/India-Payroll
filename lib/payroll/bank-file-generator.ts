/**
 * BANK PAYMENT FILE GENERATOR
 * 
 * Supported Formats:
 * - NEFT (National Electronic Funds Transfer)
 * - RTGS (Real Time Gross Settlement)
 * - IMPS (Immediate Payment Service)
 * - Direct Credit (Bank-specific format)
 * 
 * Standard Format: NPCI Unified Payment File
 */

export interface BankPaymentRecord {
    employeeCode: string;
    employeeName: string;
    accountNumber: string;
    ifscCode: string;
    amount: number;
    email?: string;
    mobile?: string;
    remarks?: string;
}

export interface BankFileHeader {
    companyName: string;
    companyAccountNumber: string;
    companyIfsc: string;
    companyBank: string;
    totalAmount: number;
    totalRecords: number;
    paymentDate: Date;
    batchNumber: string;
}

export class BankFileGenerator {

    /**
     * Generate NEFT/RTGS payment file
     * Format: Fixed-width or CSV based on bank requirements
     */
    static generateNEFT(
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        const lines: string[] = [];

        // Header Record (H)
        lines.push(this.generateHeaderRecord(header));

        // Detail Records (D)
        payments.forEach((payment, index) => {
            lines.push(this.generateDetailRecord(payment, index + 1));
        });

        // Trailer Record (T)
        lines.push(this.generateTrailerRecord(header, payments));

        return lines.join('\n');
    }

    private static generateHeaderRecord(header: BankFileHeader): string {
        const date = header.paymentDate.toISOString().split('T')[0].replace(/-/g, '');

        // Format: H|CompanyName|AccountNo|IFSC|TotalAmount|TotalCount|Date|BatchNo
        return [
            'H',
            header.companyName.substring(0, 40).padEnd(40),
            header.companyAccountNumber.padEnd(20),
            header.companyIfsc.padEnd(11),
            header.totalAmount.toFixed(2).padStart(15, '0'),
            header.totalRecords.toString().padStart(8, '0'),
            date,
            header.batchNumber.padEnd(10)
        ].join('|');
    }

    private static generateDetailRecord(
        payment: BankPaymentRecord,
        serialNo: number
    ): string {
        // Format: D|SerialNo|BeneficiaryName|AccountNo|IFSC|Amount|PaymentMode|Email|Mobile|Remarks
        return [
            'D',
            serialNo.toString().padStart(8, '0'),
            payment.employeeName.substring(0, 40).padEnd(40),
            payment.accountNumber.padEnd(20),
            payment.ifscCode.padEnd(11),
            payment.amount.toFixed(2).padStart(15, '0'),
            'NEFT',
            payment.email || ''.padEnd(50),
            payment.mobile || ''.padEnd(10),
            (payment.remarks || `Salary-${payment.employeeCode}`).substring(0, 30).padEnd(30)
        ].join('|');
    }

    private static generateTrailerRecord(
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalRecords = payments.length;

        // Format: T|TotalRecords|TotalAmount
        return [
            'T',
            totalRecords.toString().padStart(8, '0'),
            totalAmount.toFixed(2).padStart(15, '0')
        ].join('|');
    }

    /**
     * Generate bank-specific format (ICICI, HDFC, SBI, etc.)
     */
    static generateBankSpecific(
        bank: 'ICICI' | 'HDFC' | 'SBI' | 'AXIS',
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        switch (bank) {
            case 'ICICI':
                return this.generateICICIFormat(header, payments);
            case 'HDFC':
                return this.generateHDFCFormat(header, payments);
            case 'SBI':
                return this.generateSBIFormat(header, payments);
            case 'AXIS':
                return this.generateAXISFormat(header, payments);
            default:
                return this.generateNEFT(header, payments);
        }
    }

    private static generateICICIFormat(
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        // ICICI Salary Upload Format (Excel/CSV)
        const lines: string[] = [];

        // Header
        lines.push('Sr. No,Beneficiary Name,Account No,IFSC Code,Amount,Email,Mobile,Narration');

        // Records
        payments.forEach((payment, index) => {
            lines.push([
                index + 1,
                payment.employeeName,
                payment.accountNumber,
                payment.ifscCode,
                payment.amount.toFixed(2),
                payment.email || '',
                payment.mobile || '',
                `Salary-${header.paymentDate.toISOString().split('T')[0]}`
            ].join(','));
        });

        return lines.join('\n');
    }

    private static generateHDFCFormat(
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        // HDFC Salary Upload Format
        const lines: string[] = [];

        lines.push('Record Type,Beneficiary Code,Beneficiary Name,Account Number,IFSC Code,Amount,Debit Account,Instrument Date,Payment Mode,Narration');

        payments.forEach((payment, index) => {
            lines.push([
                'N',
                payment.employeeCode,
                payment.employeeName,
                payment.accountNumber,
                payment.ifscCode,
                payment.amount.toFixed(2),
                header.companyAccountNumber,
                header.paymentDate.toISOString().split('T')[0],
                'NEFT',
                `Salary Payment`
            ].join(','));
        });

        return lines.join('\n');
    }

    private static generateSBIFormat(
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        // SBI e-payment Format
        const lines: string[] = [];

        lines.push('Payment Serial No,Beneficiary Name,Beneficiary Account No,Beneficiary IFSC,Amount,Payment Date,Narration');

        payments.forEach((payment, index) => {
            lines.push([
                (index + 1).toString(),
                payment.employeeName,
                payment.accountNumber,
                payment.ifscCode,
                payment.amount.toFixed(2),
                header.paymentDate.toISOString().split('T')[0],
                `Salary-${payment.employeeCode}`
            ].join(','));
        });

        return lines.join('\n');
    }

    private static generateAXISFormat(
        header: BankFileHeader,
        payments: BankPaymentRecord[]
    ): string {
        // AXIS Bulk Payment Format
        return this.generateHDFCFormat(header, payments); // Similar format
    }

    /**
     * Validate IFSC code
     */
    static isValidIFSC(ifsc: string): boolean {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc);
    }

    /**
     * Validate account number (basic check)
     */
    static isValidAccountNumber(accountNo: string): boolean {
        return /^[0-9]{9,18}$/.test(accountNo);
    }
}
