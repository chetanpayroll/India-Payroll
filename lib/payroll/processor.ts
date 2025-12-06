/**
 * CORE PAYROLL PROCESSOR
 * Orchestrates the calculation for the entire company
 */

import { PFCalculator } from './statutory/pf';
import { ESICalculator } from './statutory/esi';
import { PTCalculator } from './statutory/pt';
import { TDSCalculator } from './statutory/tds';

// Mock Interfaces matching Prisma Schema partially
interface EmployeeData {
    id: string;
    employeeCode: string;
    name: string; // Combined first + last
    dateOfJoining: Date;
    department: string;
    designation: string;
    pan: string;
    uan: string;
    salaryStructure: {
        basicSalary: number;
        hra: number;
        specialAllowance: number;
        transportAllowance: number;
        medicalAllowance: number;
        otherAllowances: number;
        pfApplicable: boolean;
        esicApplicable: boolean;
        ptApplicable: boolean;
    };
    location?: string; // For PT state
    gender?: string;
}

interface AttendanceData {
    employeeId: string;
    daysWorked: number;
    lopDays: number;
    overtimeHours: number;
}

interface ProcessedPayroll {
    summary: {
        totalGross: number;
        totalDeductions: number;
        totalNet: number;
    };
    details: any[];
}

export class PayrollProcessor {

    /**
     * Process Payroll for a batch of employees
     */
    static processBatch(
        employees: EmployeeData[],
        attendance: AttendanceData[],
        month: number,
        year: number
    ): ProcessedPayroll {

        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        const details = [];

        const daysInMonth = new Date(year, month, 0).getDate();

        for (const emp of employees) {
            // 1. Get Attendance
            const att = attendance.find(a => a.employeeId === emp.id) || {
                employeeId: emp.id,
                daysWorked: daysInMonth, // Default full presence if missing
                lopDays: 0,
                overtimeHours: 0
            };

            // 2. Calculate Earnings (Prorated)
            const payableDays = Math.max(0, daysInMonth - att.lopDays);
            const prorationFactor = payableDays / daysInMonth;

            const struct = emp.salaryStructure;

            // Prorated Components
            const basic = Math.round(struct.basicSalary * prorationFactor);
            const hra = Math.round(struct.hra * prorationFactor);
            const special = Math.round(struct.specialAllowance * prorationFactor);
            const transport = Math.round(struct.transportAllowance * prorationFactor);
            const medical = Math.round(struct.medicalAllowance * prorationFactor);
            const other = Math.round(struct.otherAllowances * prorationFactor);

            // Variable Pay (Overtime logic placeholder)
            const overtimeRate = (struct.basicSalary / 26 / 8) * 2; // Double rate? Standard assumption
            const overtimePay = Math.round(overtimeRate * att.overtimeHours);

            const grossEarnings = basic + hra + special + transport + medical + other + overtimePay;

            // 3. Statutory Deductions

            // PF
            let pfEmployee = 0;
            let pfEmployer = 0;
            if (struct.pfApplicable) {
                const pfResult = PFCalculator.calculate(basic); // PF on Earned Basic
                pfEmployee = pfResult.employeeContribution;
                pfEmployer = pfResult.totalEmployerContribution;
            }

            // ESI
            let esiEmployee = 0;
            let esiEmployer = 0;
            if (struct.esicApplicable) {
                // Check eligibility on GROSS EARNINGS
                // Note: Usually eligibility is checked on 'Gross Wages' excluding some components, 
                // but for standard payroll we assume Gross Earnings matches ESI Wages mostly.
                const esiResult = ESICalculator.calculate(grossEarnings, payableDays);
                esiEmployee = esiResult.employeeContribution;
                esiEmployer = esiResult.employerContribution;
            }

            // PT
            let pt = 0;
            if (struct.ptApplicable) {
                // Determine state from location or default to MH
                const state = emp.location || 'MH';
                pt = PTCalculator.calculate(state, grossEarnings, emp.gender || 'Male');
            }

            // TDS
            const tds = TDSCalculator.calculate(grossEarnings, 'New'); // Defaulting New Regime

            // 4. Total Deductions & Net
            const employeeDeductions = pfEmployee + esiEmployee + pt + tds;
            const netPay = grossEarnings - employeeDeductions;

            // Accumulate
            totalGross += grossEarnings;
            totalDeductions += employeeDeductions;
            totalNet += netPay;

            details.push({
                employeeId: emp.id,
                employeeName: emp.name,
                earnings: {
                    basic, hra, special, transport, medical, other, overtimePay, grossEarnings
                },
                deductions: {
                    pfEmployee, esiEmployee, pt, tds, totalDeductions
                },
                employerContributions: {
                    pfEmployer, esiEmployer
                },
                netPay,
                attendance: {
                    daysInMonth,
                    payableDays,
                    lopDays: att.lopDays
                }
            });
        }

        return {
            summary: {
                totalGross,
                totalDeductions,
                totalNet
            },
            details
        };
    }
}
