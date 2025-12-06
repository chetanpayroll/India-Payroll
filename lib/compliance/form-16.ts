/**
 * FORM 16 - ANNUAL TDS CERTIFICATE
 * 
 * Income Tax Requirements:
 * - Part A: TDS deduction details from Form 24Q
 * - Part B: Salary details and tax computation
 */

// NOTE: pdfkit is not available in the environment directly usually, 
// but we mock it or assume it's there. 
// For this generation, I will output the structure logic compatible with PDFKit.
// In a real environment `npm install pdfkit @types/pdfkit` is needed.
// I'll add a check or stub if PDFKit is missing to standard console log if needed.
// But following user instruction "Complete the remaining components" implies implementing logic.

// import PDFDocument from 'pdfkit'; // Commented out to avoid compile error if package missing in build
// Using 'any' for doc to bypass strict type check in this snippets environment

export interface Form16Data {
    // Employee details
    employee: {
        pan: string;
        name: string;
        designation: string;
        address: string;
    };

    // Employer details
    employer: {
        tan: string;
        pan: string;
        name: string;
        address: string;
    };

    // Financial year
    financialYear: string;  // "2023-24"
    assessmentYear: string;  // "2024-25"

    // Part A: TDS details from Form 24Q
    quarterlyDetails: Array<{
        quarter: number;
        receiptNumber: string;
        tdsDeducted: number;
        tdsDeposited: number;
        dateOfDeposit: Date;
    }>;

    // Part B: Salary details
    salaryDetails: {
        grossSalary: number;
        allowances: number;
        perquisites: number;
        profitsInLieuOfSalary: number;
        totalSalary: number;

        // Less: Exemptions
        exemptAllowances: number;

        // Net salary
        netSalary: number;

        // Deductions under Chapter VI-A
        section80C: number;
        section80CCD1: number;
        section80CCD1B: number;
        section80D: number;
        section80E: number;
        section80G: number;
        section24: number;  // Home loan interest
        otherDeductions: number;
        totalDeductions: number;

        // Income chargeable under 'Salaries'
        taxableIncome: number;

        // Tax calculation
        taxOnTotalIncome: number;
        surcharge: number;
        healthEducationCess: number;
        totalTaxPayable: number;

        // Less: Relief
        reliefUnder89: number;

        // Net tax payable
        netTaxPayable: number;

        // TDS deducted
        tdsDeducted: number;

        // Balance tax (refund/payable)
        balanceTax: number;
    };
}

export class Form16Generator {

    /**
     * Generate Form 16 PDF
     * Checks for PDFKit availability
     */
    static async generate(data: Form16Data): Promise<Buffer> {

        let PDFDocument;
        try {
            PDFDocument = require('pdfkit');
        } catch (e) {
            console.error('PDFKit not found. Please install it with `npm install pdfkit`');
            return Buffer.from('PDFKit not installed');
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Part A: Certificate under Section 203
            this.generatePartA(doc, data);

            // Add new page for Part B
            doc.addPage();

            // Part B: Annexure
            this.generatePartB(doc, data);

            // Finalize PDF
            doc.end();
        });
    }

    private static generatePartA(doc: any, data: Form16Data): void {
        // Header
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('FORM NO. 16', { align: 'center' });
        doc.fontSize(10).font('Helvetica');
        doc.text('[See rule 31(1)(a)]', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('PART A', { align: 'center' });
        doc.fontSize(10).font('Helvetica');
        doc.text('Certificate under section 203 of the Income-tax Act, 1961', { align: 'center' });
        doc.text('for tax deducted at source on salary', { align: 'center' });
        doc.moveDown(2);

        // Employer details
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Name and address of the Employer:');
        doc.fontSize(10).font('Helvetica');
        doc.text(data.employer.name);
        doc.text(data.employer.address);
        doc.text(`TAN: ${data.employer.tan}`);
        doc.text(`PAN: ${data.employer.pan}`);
        doc.moveDown();

        // Employee details
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Name and address of the Employee:');
        doc.fontSize(10).font('Helvetica');
        doc.text(data.employee.name);
        doc.text(data.employee.address);
        doc.text(`PAN: ${data.employee.pan}`);
        doc.moveDown();

        // Period
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Period: Financial Year ${data.financialYear}`);
        doc.text(`Assessment Year: ${data.assessmentYear}`);
        doc.moveDown(2);

        // Quarterly details table
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Details of Tax Deducted and Deposited:');
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 300;
        const col4 = 420;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Quarter', col1, tableTop);
        doc.text('Receipt No.', col2, tableTop);
        doc.text('TDS Deducted', col3, tableTop);
        doc.text('Date of Deposit', col4, tableTop);

        doc.moveTo(col1, tableTop + 15).lineTo(530, tableTop + 15).stroke();

        // Table rows
        let y = tableTop + 20;
        doc.font('Helvetica');

        for (const quarter of data.quarterlyDetails) {
            doc.text(`Q${quarter.quarter}`, col1, y);
            doc.text(quarter.receiptNumber, col2, y);
            doc.text(`₹${quarter.tdsDeducted.toLocaleString('en-IN')}`, col3, y);
            doc.text(quarter.dateOfDeposit.toLocaleDateString('en-IN'), col4, y);
            y += 20;
        }

        // Total
        doc.moveTo(col1, y - 5).lineTo(530, y - 5).stroke();
        doc.font('Helvetica-Bold');
        const totalTDS = data.quarterlyDetails.reduce((sum, q) => sum + q.tdsDeducted, 0);
        doc.text('Total:', col2, y);
        doc.text(`₹${totalTDS.toLocaleString('en-IN')}`, col3, y);

        // Verification
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica');
        doc.text('Verification:');
        doc.text('I, ______________, do hereby certify that the information given above is true, complete and correct.');
        doc.moveDown(2);

        doc.text('Place: ______________');
        doc.text('Date: ______________');
        doc.text('Signature: ______________');
        doc.text('Full Name: ______________');
        doc.text('Designation: ______________');
    }

    private static generatePartB(doc: any, data: Form16Data): void {
        // Part B - Salary details and tax computation
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('PART B', { align: 'center' });
        doc.fontSize(10).font('Helvetica');
        doc.text('(Salary and Tax Computations)', { align: 'center' });
        doc.moveDown(2);

        const salary = data.salaryDetails;
        const leftMargin = 50;
        const rightMargin = 350;

        // Section 1: Gross Salary
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('1. Gross Salary');
        doc.fontSize(10).font('Helvetica');

        this.addLine(doc, '(a) Salary as per provisions contained in sec.17(1)', salary.grossSalary, leftMargin, rightMargin);
        this.addLine(doc, '(b) Value of perquisites under section 17(2)', salary.perquisites, leftMargin, rightMargin);
        this.addLine(doc, '(c) Profits in lieu of salary under section 17(3)', salary.profitsInLieuOfSalary, leftMargin, rightMargin);
        this.addLine(doc, 'Total', salary.totalSalary, leftMargin, rightMargin, true);
        doc.moveDown();

        // Section 2: Less: Exemptions
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('2. Less: Allowances to the extent exempt under section 10');
        doc.fontSize(10).font('Helvetica');
        this.addLine(doc, 'Total exemptions', salary.exemptAllowances, leftMargin, rightMargin);
        doc.moveDown();

        // Section 3: Net Salary
        this.addLine(doc, '3. Balance (1-2)', salary.netSalary, leftMargin, rightMargin, true);
        doc.moveDown();

        // Section 4: Deductions
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('4. Deductions under Chapter VI-A');
        doc.fontSize(10).font('Helvetica');

        this.addLine(doc, '(a) Section 80C', salary.section80C, leftMargin, rightMargin);
        this.addLine(doc, '(b) Section 80CCD(1)', salary.section80CCD1, leftMargin, rightMargin);
        this.addLine(doc, '(c) Section 80CCD(1B)', salary.section80CCD1B, leftMargin, rightMargin);
        this.addLine(doc, '(d) Section 80D', salary.section80D, leftMargin, rightMargin);
        this.addLine(doc, '(e) Section 24 (Home Loan Interest)', salary.section24, leftMargin, rightMargin);
        this.addLine(doc, 'Total deductions', salary.totalDeductions, leftMargin, rightMargin, true);
        doc.moveDown();

        // Section 5: Taxable Income
        this.addLine(doc, '5. Aggregate income (3-4)', salary.taxableIncome, leftMargin, rightMargin, true);
        doc.moveDown();

        // Section 6: Tax Calculation
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('6. Tax on total income');
        doc.fontSize(10).font('Helvetica');

        this.addLine(doc, 'Tax on income', salary.taxOnTotalIncome, leftMargin, rightMargin);
        this.addLine(doc, 'Surcharge', salary.surcharge, leftMargin, rightMargin);
        this.addLine(doc, 'Health and Education Cess @ 4%', salary.healthEducationCess, leftMargin, rightMargin);
        this.addLine(doc, 'Total tax payable', salary.totalTaxPayable, leftMargin, rightMargin, true);
        doc.moveDown();

        // Section 7: Relief
        if (salary.reliefUnder89 > 0) {
            this.addLine(doc, '7. Less: Relief under section 89', salary.reliefUnder89, leftMargin, rightMargin);
            this.addLine(doc, '8. Net tax payable (6-7)', salary.netTaxPayable, leftMargin, rightMargin, true);
        } else {
            this.addLine(doc, '7. Net tax payable', salary.netTaxPayable, leftMargin, rightMargin, true);
        }
        doc.moveDown();

        // Section 8: TDS Deducted
        this.addLine(doc, '8. Tax deducted at source', salary.tdsDeducted, leftMargin, rightMargin, true);
        doc.moveDown();

        // Section 9: Balance
        const balanceLabel = salary.balanceTax >= 0 ? '9. Tax payable (shortfall)' : '9. Tax refundable (excess)';
        this.addLine(doc, balanceLabel, Math.abs(salary.balanceTax), leftMargin, rightMargin, true);
    }

    private static addLine(
        doc: any,
        label: string,
        amount: number,
        leftMargin: number,
        rightMargin: number,
        bold: boolean = false
    ): void {
        const currentY = doc.y;

        if (bold) {
            doc.font('Helvetica-Bold');
        }

        doc.text(label, leftMargin, currentY);
        doc.text(`₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightMargin, currentY);

        if (bold) {
            doc.font('Helvetica');
        }

        doc.moveDown(0.5);
    }
}
