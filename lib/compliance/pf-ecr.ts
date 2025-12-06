/**
 * PROVIDENT FUND - ELECTRONIC CHALLAN CUM RETURN (ECR)
 * 
 * EPFO Requirements:
 * - File format: Text file (pipe-separated values)
 */

export interface ECREmployee {
    uan: string;
    name: string;
    grossWages: number;
    pfWages: number;
    epsWages: number;
    edliWages: number;
    eeShare: number;      // Employee contribution
    epsShare: number;     // Employer EPS contribution
    erShare: number;      // Employer EPF contribution
    ncpDays: number;      // Non-contributory period days
    refund: number;       // Usually 0
}

export interface ECRFile {
    establishmentId: string;
    month: number;
    year: number;
    totalEmployees: number;
    totalWages: number;
    totalEEContribution: number;
    totalEPSContribution: number;
    totalERContribution: number;
    content: string;
    fileName: string;
}

export class PFECRGenerator {

    /**
     * Generate complete ECR file
     */
    static generate(
        companyId: string,
        month: number,  // 1-12
        year: number,
        employees: ECREmployee[],
        establishmentDetails: {
            pfCode: string;
            establishmentId: string;
            name: string;
        }
    ): ECRFile {

        // Validate inputs (skipped for brevity)

        const lines: string[] = [];

        // Header section
        lines.push('#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#');
        lines.push(`# PF ECR for ${this.getMonthName(month)} ${year}`);
        lines.push(`# Establishment: ${establishmentDetails.name}`);
        lines.push(`# PF Code: ${establishmentDetails.pfCode}`);
        lines.push(`# Generated: ${new Date().toISOString()}`);
        lines.push(`# Total Employees: ${employees.length}`);
        lines.push('#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#');
        lines.push('');

        // Column headers (for reference, not in actual file)
        lines.push('# Format: UAN#Name#Gross Wages#EPF Wages#EPS Wages#EDLI Wages#EE Share#EPS Share#ER Share#NCP Days#Refund');
        lines.push('');

        // Employee data rows
        let totalWages = 0;
        let totalEE = 0;
        let totalEPS = 0;
        let totalER = 0;

        for (const emp of employees) {
            if (!emp.uan) {
                continue;
            }

            const row = [
                emp.uan,
                emp.name.replace(/[^a-zA-Z\s]/g, ''), // Remove special chars
                emp.grossWages,
                emp.pfWages,
                emp.epsWages,
                emp.edliWages,
                emp.eeShare,
                emp.epsShare,
                emp.erShare,
                emp.ncpDays,
                emp.refund
            ].join('#');

            lines.push(row);

            // Accumulate totals
            totalWages += emp.grossWages;
            totalEE += emp.eeShare;
            totalEPS += emp.epsShare;
            totalER += emp.erShare;
        }

        // Footer section
        lines.push('');
        lines.push('#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#');
        lines.push(`# Total Gross Wages: ${totalWages}`);
        lines.push(`# Total EE Contribution: ${totalEE}`);
        lines.push(`# Total EPS Contribution: ${totalEPS}`);
        lines.push(`# Total ER Contribution: ${totalER}`);
        lines.push(`# Grand Total: ${(totalEE + totalEPS + totalER)}`);
        lines.push('#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#');

        const content = lines.join('\n');
        const fileName = `ECR_${establishmentDetails.pfCode}_${year}${month.toString().padStart(2, '0')}.txt`;

        return {
            establishmentId: establishmentDetails.establishmentId,
            month,
            year,
            totalEmployees: employees.length,
            totalWages,
            totalEEContribution: totalEE,
            totalEPSContribution: totalEPS,
            totalERContribution: totalER,
            content,
            fileName
        };
    }

    private static getMonthName(month: number): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    }
}
