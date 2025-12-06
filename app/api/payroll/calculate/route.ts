
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PayrollProcessor } from '@/lib/payroll/processor';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { companyId, month, year, save } = body;

        if (!companyId || !month || !year) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // 1. Fetch Employees with Salary Structure
        // Since DB might be down for me, I'm writing valid Prisma code
        const employees = await prisma.employee.findMany({
            where: {
                companyId,
                status: 'Active',
            },
            include: {
                salaryStructure: true
            }
        });

        if (employees.length === 0) {
            return NextResponse.json({ message: 'No active employees found' }, { status: 404 });
        }

        // 2. Prepare Data for Processor
        const empData = employees.map(e => ({
            id: e.id,
            employeeCode: e.employeeCode,
            name: `${e.firstName} ${e.lastName}`,
            dateOfJoining: e.dateOfJoining,
            department: e.department || 'General',
            designation: e.designation || 'Staff',
            pan: e.pan || '',
            uan: e.uan || '',
            salaryStructure: {
                basicSalary: e.salaryStructure?.basicSalary.toNumber() || 0,
                hra: e.salaryStructure?.hra?.toNumber() || 0,
                specialAllowance: e.salaryStructure?.specialAllowance?.toNumber() || 0,
                transportAllowance: e.salaryStructure?.transportAllowance?.toNumber() || 0,
                medicalAllowance: e.salaryStructure?.medicalAllowance?.toNumber() || 0,
                otherAllowances: e.salaryStructure?.otherAllowances?.toNumber() || 0,
                pfApplicable: e.salaryStructure?.pfApplicable ?? true,
                esicApplicable: e.salaryStructure?.esicApplicable ?? false,
                ptApplicable: e.salaryStructure?.ptApplicable ?? true,
            },
            location: e.location || 'Mumbai', // Default to MH keys
            gender: e.gender || 'Male'
        }));

        // 3. Mock Attendance (In production, fetch from AttendanceRecords)
        // For now, assuming full attendance for everyone
        const attendance = empData.map(e => ({
            employeeId: e.id,
            daysWorked: new Date(year, month, 0).getDate(), // Full month
            lopDays: 0,
            overtimeHours: 0
        }));

        // 4. Run Calc
        const result = PayrollProcessor.processBatch(empData, attendance, month, year);

        // 5. Save if requested
        if (save) {
            // Transaction to save Run and Details
            // Note: This requires the Prisma Schema changes to be pushed!
            const run = await prisma.$transaction(async (tx) => {
                const payrollRun = await tx.payrollRun.create({
                    data: {
                        companyId,
                        payrollMonth: month,
                        payrollYear: year,
                        payPeriodStart: new Date(year, month - 1, 1),
                        payPeriodEnd: new Date(year, month, 0),
                        status: 'Draft',
                        totalEmployees: result.details.length,
                        totalGross: result.summary.totalGross,
                        totalDeductions: result.summary.totalDeductions,
                        totalNetPay: result.summary.totalNet,
                        // Could map other fields
                    }
                });

                // Create Details
                for (const detail of result.details) {
                    await tx.payrollDetail.create({
                        data: {
                            payrollRunId: payrollRun.id,
                            employeeId: detail.employeeId,
                            basicSalary: detail.earnings.basic,
                            hra: detail.earnings.hra,
                            specialAllowance: detail.earnings.special,
                            grossEarnings: detail.earnings.grossEarnings,
                            pfEmployee: detail.deductions.pfEmployee,
                            esicEmployee: detail.deductions.esicEmployee,
                            professionalTax: detail.deductions.pt,
                            tds: detail.deductions.tds,
                            totalDeductions: detail.deductions.totalDeductions,
                            netPay: detail.netPay,
                            daysWorked: detail.attendance.payableDays,
                            // Map other fields
                        }
                    });
                }

                return payrollRun;
            });

            return NextResponse.json({ ...result, runId: run.id });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('[PAYROLL_CALC]', error);
        return new NextResponse('Internal Calculation Error', { status: 500 });
    }
}
