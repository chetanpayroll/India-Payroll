/**
 * PROFESSIONAL PAYSLIP PDF GENERATOR
 * 
 * Features:
 * - Company branding
 * - Professional layout
 */

// NOTE: pdfkit is not available in the environment directly usually.
// Logic adapted to avoid direct runtime dependency until installed.

// import PDFDocument from 'pdfkit'; // Use require in try/catch for robustness

export interface PayslipData {
    // Company details
    company: {
        name: string;
        address: string;
        logoUrl?: string;
        pan: string;
        tan: string;
        pfCode: string;
        esicCode: string;
    };

    // Employee details
    employee: {
        code: string;
        name: string;
        designation: string;
        department: string;
        dateOfJoining: Date;
        pan: string;
        uan: string;
        bankAccount: string;
        bankIfsc: string;
    };

    // Pay period
    month: number;
    year: number;
    paymentDate: Date;
    daysInMonth: number;
    daysWorked: number;
    lopDays: number;

    // Earnings
    earnings: {
        basic: number;
        hra: number;
        specialAllowance: number;
        transport: number;
        medical: number;
        other: number;
        overtime: number;
        bonus: number;
        arrears: number;
        reimbursements: number;
        grossEarnings: number;
    };

    // Deductions
    deductions: {
        pf: number;
        esic: number;
        pt: number;
        tds: number;
        lwf: number;
        loan: number;
        advance: number;
        other: number;
        totalDeductions: number;
    };

    // Net pay
    netPay: number;
    netPayInWords: string;

    // Employer contributions (for information)
    employerContributions: {
        pf: number;
        esic: number;
        lwf: number;
        total: number;
    };

    // Year-to-date summary
    ytd: {
        grossEarnings: number;
        deductions: number;
        netPay: number;
        tds: number;
    };
}

export class PayslipGenerator {

    private static readonly PRIMARY_COLOR = '#2C3E50';
    private static readonly ACCENT_COLOR = '#3498DB';
    private static readonly TEXT_COLOR = '#333333';
    private static readonly LIGHT_GRAY = '#ECF0F1';

    /**
     * Generate professional payslip PDF
     */
    static async generate(data: PayslipData): Promise<Buffer> {

        let PDFDocument;
        try {
            PDFDocument = require('pdfkit');
        } catch (e) {
            console.error('PDFKit not found. Please install it with `npm install pdfkit`');
            return Buffer.from('PDFKit not installed');
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 30,
                info: {
                    Title: `Payslip - ${data.employee.name} - ${this.getMonthName(data.month)} ${data.year}`,
                    Author: data.company.name,
                    Subject: 'Salary Slip',
                    Keywords: 'payslip, salary, earnings, deductions'
                }
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Generate payslip content
            this.generateHeader(doc, data);
            this.generateEmployeeInfo(doc, data);
            this.generatePayPeriodInfo(doc, data);
            this.generateEarningsDeductions(doc, data);
            this.generateNetPay(doc, data);
            this.generateYTDSummary(doc, data);
            this.generateEmployerContributions(doc, data);
            this.generateFooter(doc, data);

            doc.end();
        });
    }

    private static generateHeader(doc: any, data: PayslipData): void {
        // Company logo (if available) - Skipped for now
        // if (data.company.logoUrl) { ... }

        // Company name and address
        doc.fontSize(18).font('Helvetica-Bold');
        doc.fillColor(this.PRIMARY_COLOR);
        doc.text(data.company.name, 150, 45);

        doc.fontSize(9).font('Helvetica');
        doc.fillColor(this.TEXT_COLOR);
        doc.text(data.company.address, 150, 70, { width: 350 });

        // Statutory details
        doc.fontSize(8);
        doc.text(`PAN: ${data.company.pan} | TAN: ${data.company.tan}`, 150, 95);
        doc.text(`PF Code: ${data.company.pfCode} | ESIC Code: ${data.company.esicCode}`, 150, 107);

        // Payslip title
        doc.fontSize(14).font('Helvetica-Bold');
        doc.fillColor(this.ACCENT_COLOR);
        doc.text('SALARY SLIP', 40, 135, { align: 'center' });

        doc.fontSize(10).font('Helvetica');
        doc.fillColor(this.TEXT_COLOR);
        doc.text(
            `${this.getMonthName(data.month)} ${data.year}`,
            40,
            153,
            { align: 'center' }
        );

        // Divider line
        doc.moveTo(40, 175).lineTo(555, 175).strokeColor(this.ACCENT_COLOR).lineWidth(2).stroke();

        doc.y = 185;
    }

    private static generateEmployeeInfo(doc: any, data: PayslipData): void {
        const startY = doc.y;
        const col1 = 40;
        const col2 = 200;
        const col3 = 320;
        const col4 = 480;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.fillColor(this.PRIMARY_COLOR);

        // Labels
        doc.text('Employee Code:', col1, startY);
        doc.text('Employee Name:', col1, startY + 15);
        doc.text('Designation:', col1, startY + 30);
        doc.text('Department:', col1, startY + 45);

        doc.text('PAN:', col3, startY);
        doc.text('UAN:', col3, startY + 15);
        doc.text('Bank A/C:', col3, startY + 30);
        doc.text('IFSC Code:', col3, startY + 45);

        // Values
        doc.font('Helvetica');
        doc.fillColor(this.TEXT_COLOR);

        doc.text(data.employee.code, col2, startY);
        doc.text(data.employee.name, col2, startY + 15);
        doc.text(data.employee.designation, col2, startY + 30);
        doc.text(data.employee.department, col2, startY + 45);

        doc.text(data.employee.pan, col4, startY);
        doc.text(data.employee.uan, col4, startY + 15);
        doc.text(data.employee.bankAccount, col4, startY + 30);
        doc.text(data.employee.bankIfsc, col4, startY + 45);

        doc.y = startY + 65;
    }

    private static generatePayPeriodInfo(doc: any, data: PayslipData): void {
        const startY = doc.y;

        // Background box
        doc.rect(40, startY, 515, 25).fillAndStroke(this.LIGHT_GRAY, this.LIGHT_GRAY);

        doc.fontSize(9).font('Helvetica-Bold');
        doc.fillColor(this.TEXT_COLOR);

        doc.text(`Days in Month: ${data.daysInMonth}`, 50, startY + 8);
        doc.text(`Days Worked: ${data.daysWorked}`, 180, startY + 8);
        doc.text(`LOP Days: ${data.lopDays}`, 310, startY + 8);
        doc.text(`Payment Date: ${data.paymentDate.toLocaleDateString('en-IN')}`, 420, startY + 8);

        doc.y = startY + 35;
    }

    private static generateEarningsDeductions(doc: any, data: PayslipData): void {
        const startY = doc.y;
        const col1 = 40;
        const col2 = 240;
        const col3 = 310;
        const col4 = 510;

        // Headers
        doc.rect(col1, startY, 250, 20).fillAndStroke(this.PRIMARY_COLOR, this.PRIMARY_COLOR);
        doc.rect(col3, startY, 245, 20).fillAndStroke(this.PRIMARY_COLOR, this.PRIMARY_COLOR);

        doc.fontSize(10).font('Helvetica-Bold');
        doc.fillColor('#FFFFFF');
        doc.text('EARNINGS', col1 + 10, startY + 6);
        doc.text('DEDUCTIONS', col3 + 10, startY + 6);

        // Earnings section
        let y = startY + 30;
        doc.fontSize(9).font('Helvetica');
        doc.fillColor(this.TEXT_COLOR);

        const earnings = [
            ['Basic Salary', data.earnings.basic],
            ['HRA', data.earnings.hra],
            ['Special Allowance', data.earnings.specialAllowance],
            ['Transport Allowance', data.earnings.transport],
            ['Medical Allowance', data.earnings.medical],
            ['Other Allowances', data.earnings.other],
            ['Overtime', data.earnings.overtime],
            ['Bonus', data.earnings.bonus],
            ['Arrears', data.earnings.arrears],
            ['Reimbursements', data.earnings.reimbursements]
        ].filter(([_, amount]) => Number(amount) > 0);

        for (const [label, amount] of earnings) {
            doc.text(label as string, col1 + 10, y);
            doc.text(`₹${(amount as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, col2, y, { align: 'right' });
            y += 18;
        }

        // Deductions section
        let yDeduct = startY + 30; // Separate Y for deductions to handle different lengths if needed, or sync?
        // Using same y flow or parallel? Parallel is better. 
        // Let's reset y for deductions or use max?
        // The prompt implementation used a single Y variable but reset it. 
        yDeduct = startY + 30;

        const deductions = [
            ['Provident Fund', data.deductions.pf],
            ['ESI', data.deductions.esic],
            ['Professional Tax', data.deductions.pt],
            ['TDS', data.deductions.tds],
            ['Labour Welfare Fund', data.deductions.lwf],
            ['Loan Recovery', data.deductions.loan],
            ['Advance Recovery', data.deductions.advance],
            ['Other Deductions', data.deductions.other]
        ].filter(([_, amount]) => Number(amount) > 0);

        for (const [label, amount] of deductions) {
            doc.text(label as string, col3 + 10, yDeduct);
            doc.text(`₹${(amount as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, col4, yDeduct, { align: 'right' });
            yDeduct += 18;
        }

        // Total line
        const maxY = Math.max(y, yDeduct, startY + 30 + (earnings.length * 18)); // Ensure space

        doc.moveTo(col1, maxY + 5).lineTo(col2 + 50, maxY + 5).strokeColor('#000000').lineWidth(1).stroke();
        doc.moveTo(col3, maxY + 5).lineTo(col4 + 45, maxY + 5).strokeColor('#000000').lineWidth(1).stroke();

        // Totals
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('GROSS EARNINGS', col1 + 10, maxY + 15);
        doc.text(`₹${data.earnings.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, col2, maxY + 15, { align: 'right' });

        doc.text('TOTAL DEDUCTIONS', col3 + 10, maxY + 15);
        doc.text(`₹${data.deductions.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, col4, maxY + 15, { align: 'right' });

        doc.y = maxY + 40;
    }

    private static generateNetPay(doc: any, data: PayslipData): void {
        const startY = doc.y;

        // Net pay box
        doc.rect(40, startY, 515, 40).fillAndStroke(this.ACCENT_COLOR, this.ACCENT_COLOR);

        doc.fontSize(12).font('Helvetica-Bold');
        doc.fillColor('#FFFFFF');
        doc.text('NET PAY', 50, startY + 8);
        doc.fontSize(16);
        doc.text(`₹${data.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 450, startY + 5, { align: 'right' });

        doc.fontSize(9).font('Helvetica');
        doc.text(`(In Words: ${data.netPayInWords})`, 50, startY + 25);

        doc.y = startY + 50;
    }

    private static generateYTDSummary(doc: any, data: PayslipData): void {
        const startY = doc.y;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.fillColor(this.PRIMARY_COLOR);
        doc.text('Year-to-Date Summary', 40, startY);

        doc.fontSize(9).font('Helvetica');
        doc.fillColor(this.TEXT_COLOR);

        const ytdData = [
            ['Gross Earnings', data.ytd.grossEarnings],
            ['Total Deductions', data.ytd.deductions],
            ['Net Pay', data.ytd.netPay],
            ['TDS Deducted', data.ytd.tds]
        ];

        let y = startY + 20;
        for (const [label, amount] of ytdData) {
            doc.text(label.toString(), 50, y);
            doc.text(`₹${(amount as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 450, y, { align: 'right' });
            y += 15;
        }

        doc.y = y + 10;
    }

    private static generateEmployerContributions(doc: any, data: PayslipData): void {
        const startY = doc.y;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.fillColor(this.PRIMARY_COLOR);
        doc.text('Employer Contributions (For Information Only)', 40, startY);

        doc.fontSize(9).font('Helvetica');
        doc.fillColor(this.TEXT_COLOR);

        doc.text(`PF: ₹${data.employerContributions.pf.toLocaleString('en-IN')}`, 50, startY + 20);
        doc.text(`ESI: ₹${data.employerContributions.esic.toLocaleString('en-IN')}`, 180, startY + 20);
        doc.text(`LWF: ₹${data.employerContributions.lwf.toLocaleString('en-IN')}`, 310, startY + 20);
        doc.text(`Total: ₹${data.employerContributions.total.toLocaleString('en-IN')}`, 440, startY + 20);

        doc.y = startY + 45;
    }

    private static generateFooter(doc: any, data: PayslipData): void {
        const pageHeight = 842; // A4 height in points
        const footerY = pageHeight - 80;

        doc.fontSize(8).font('Helvetica-Italic');
        doc.fillColor('#777777');
        doc.text(
            'This is a computer-generated payslip and does not require a signature.',
            40,
            footerY,
            { align: 'center', width: 515 }
        );

        doc.fontSize(7);
        doc.text(
            'For queries, contact HR Department | Confidential Document',
            40,
            footerY + 15,
            { align: 'center', width: 515 }
        );

        doc.text(
            `Generated on: ${new Date().toLocaleString('en-IN')}`,
            40,
            footerY + 30,
            { align: 'center', width: 515 }
        );
    }

    private static getMonthName(month: number): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    }
}
