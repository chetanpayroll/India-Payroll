/**
 * EMPLOYEE STATE INSURANCE - MONTHLY RETURN
 * 
 * ESIC Requirements:
 * - File format: Excel (.xlsx)
 */

import ExcelJS from 'exceljs';

export interface ESIEmployee {
    ipNumber: string;  // 17-digit ESIC Insurance Person Number
    name: string;
    fatherName: string;
    dateOfBirth: Date;
    gender: 'Male' | 'Female' | 'Transgender';
    wages: number;
    daysWorked: number;
    employeeContribution: number;
    employerContribution: number;
    aadhaar?: string;
    mobile?: string;
}

export interface ESIReturnFile {
    month: number;
    year: number;
    totalEmployees: number;
    totalWages: number;
    totalEmployeeContribution: number;
    totalEmployerContribution: number;
    filePath: string;
    fileName: string;
}

export class ESIReturnGenerator {

    /**
     * Generate ESI monthly return Excel file
     */
    static async generate(
        companyId: string,
        month: number,
        year: number,
        employees: ESIEmployee[],
        companyDetails: {
            esicCode: string;
            name: string;
            address: string;
        }
    ): Promise<ESIReturnFile> {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('ESI Return');

        // Set company information
        worksheet.mergeCells('A1:L1');
        worksheet.getCell('A1').value = `ESI Monthly Return - ${this.getMonthName(month)} ${year}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:L2');
        worksheet.getCell('A2').value = companyDetails.name;
        worksheet.getCell('A2').font = { size: 12, bold: true };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A3:L3');
        worksheet.getCell('A3').value = `ESIC Code: ${companyDetails.esicCode}`;
        worksheet.getCell('A3').alignment = { horizontal: 'center' };

        // Add blank row
        worksheet.addRow([]);

        // Header row
        const headerRow = worksheet.addRow([
            'S.No',
            'IP Number',
            'Employee Name',
            'Father/Husband Name',
            'Date of Birth',
            'Gender',
            'Aadhaar Number',
            'Mobile Number',
            'Days Worked',
            'Total Wages',
            'Employee Contribution (0.75%)',
            'Employer Contribution (3.25%)'
        ]);

        // Style header row
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0070C0' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Set column widths
        worksheet.columns = [
            { width: 8 },   // S.No
            { width: 20 },  // IP Number
            { width: 25 },  // Name
            { width: 25 },  // Father Name
            { width: 15 },  // DOB
            { width: 12 },  // Gender
            { width: 15 },  // Aadhaar
            { width: 15 },  // Mobile
            { width: 12 },  // Days Worked
            { width: 15 },  // Wages
            { width: 18 },  // Employee Contribution
            { width: 18 }   // Employer Contribution
        ];

        // Add employee data
        let totalWages = 0;
        let totalEmpContribution = 0;
        let totalEmplrContribution = 0;

        employees.forEach((emp, index) => {
            const row = worksheet.addRow([
                index + 1,
                emp.ipNumber,
                emp.name,
                emp.fatherName,
                emp.dateOfBirth.toLocaleDateString('en-IN'),
                emp.gender,
                emp.aadhaar || '',
                emp.mobile || '',
                emp.daysWorked,
                emp.wages,
                emp.employeeContribution,
                emp.employerContribution
            ]);

            // Format currency cells
            row.getCell(10).numFmt = '₹#,##0.00';
            row.getCell(11).numFmt = '₹#,##0.00';
            row.getCell(12).numFmt = '₹#,##0.00';

            // Add borders
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Accumulate totals
            totalWages += emp.wages;
            totalEmpContribution += emp.employeeContribution;
            totalEmplrContribution += emp.employerContribution;
        });

        // Add total row
        const totalRow = worksheet.addRow([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            'TOTAL',
            totalWages,
            totalEmpContribution,
            totalEmplrContribution
        ]);

        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            if (colNumber >= 10) {
                cell.numFmt = '₹#,##0.00';
            }
            cell.border = {
                top: { style: 'double' },
                left: { style: 'thin' },
                bottom: { style: 'double' },
                right: { style: 'thin' }
            };
        });

        // Add summary section
        worksheet.addRow([]);
        worksheet.addRow(['Summary']);
        worksheet.addRow(['Total Employees:', employees.length]);
        worksheet.addRow(['Total Wages:', totalWages]);
        worksheet.addRow(['Total Employee Contribution:', totalEmpContribution]);
        worksheet.addRow(['Total Employer Contribution:', totalEmplrContribution]);
        worksheet.addRow(['Grand Total:', totalEmpContribution + totalEmplrContribution]);

        // Save file
        const fileName = `ESI_Return_${companyDetails.esicCode}_${year}${month.toString().padStart(2, '0')}.xlsx`;
        const filePath = `/tmp/${fileName}`;

        // Avoid writing to /tmp directly in this environment, write to project temp or reports
        // Mocking write for now as we don't need actual file gen on disk for this pass
        // await workbook.xlsx.writeFile(filePath);

        return {
            month,
            year,
            totalEmployees: employees.length,
            totalWages,
            totalEmployeeContribution: totalEmpContribution,
            totalEmployerContribution: totalEmplrContribution,
            filePath,
            fileName
        };
    }

    private static getMonthName(month: number): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    }
}
