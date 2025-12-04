import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { eachDayOfInterval, startOfDay, isWeekend } from 'date-fns';

const ApproveSchema = z.object({
    approverId: z.string().optional(), // Optional, can use session user
    remarks: z.string().optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // RBAC Check
        if (!['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;
        const body = await request.json();
        const validated = ApproveSchema.parse(body);

        // 1. Get Leave Request
        const leave = await prisma.leave.findUnique({
            where: { id },
            include: { employee: true }
        });

        if (!leave) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        if (leave.status !== 'PENDING') {
            return NextResponse.json({ error: `Leave is already ${leave.status}` }, { status: 400 });
        }

        // 2. Deduct Balance
        // Note: We assume validation happened at application, but we should double check or just force deduct.
        // Ideally, we check again to be safe.
        const currentYear = new Date().getFullYear();
        const balance = await prisma.leaveBalance.findUnique({
            where: {
                employeeId_year: {
                    employeeId: leave.employeeId,
                    year: currentYear
                }
            }
        });

        if (balance) {
            const days = Number(leave.numberOfDays);
            let updateData: any = {};

            if (leave.leaveType === 'ANNUAL') {
                if (Number(balance.annualLeaveBalance) < days) {
                    return NextResponse.json({ error: 'Insufficient annual leave balance at approval time' }, { status: 400 });
                }
                updateData = {
                    annualLeaveBalance: { decrement: days },
                    annualLeaveTaken: { increment: days }
                };
            } else if (leave.leaveType === 'SICK') {
                if (Number(balance.sickLeaveBalance) < days) {
                    return NextResponse.json({ error: 'Insufficient sick leave balance at approval time' }, { status: 400 });
                }
                updateData = {
                    sickLeaveBalance: { decrement: days },
                    sickLeaveTaken: { increment: days }
                };
            } else {
                // Just track taken for others
                if (leave.leaveType === 'UNPAID') updateData = { unpaidLeaveTaken: { increment: days } };
                else if (leave.leaveType === 'MATERNITY') updateData = { maternityLeaveTaken: { increment: days } };
                else if (leave.leaveType === 'PATERNITY') updateData = { paternityLeaveTaken: { increment: days } };
                else if (leave.leaveType === 'EMERGENCY') updateData = { emergencyLeaveTaken: { increment: days } };
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.leaveBalance.update({
                    where: { id: balance.id },
                    data: updateData
                });
            }
        }

        // 3. Update Leave Status
        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: session.user.id,
                approvedDate: new Date(),
                // Store approval chain info if needed
            }
        });

        // 4. Auto-Mark Attendance
        // Create attendance records for each day of the leave
        const days = eachDayOfInterval({ start: leave.startDate, end: leave.endDate });

        // Fetch holidays to skip or mark differently?
        // Usually, leave spans weekends/holidays depending on policy.
        // If policy says "Include Weekends", we mark them as LEAVE.
        // If "Exclude", we skip.
        // For simplicity here, we assume the `numberOfDays` calculation handled the count,
        // but for attendance, we should mark the days that are actually "Leave".
        // If a range includes a weekend and policy excludes it, that day is WEEKEND, not LEAVE.

        // Let's mark all days in range as LEAVE for now, unless it's a weekend and we want to preserve WEEKEND status.
        // A safer bet is to upsert.

        for (const day of days) {
            const date = startOfDay(day);

            // Skip if weekend (simple check, ideally check shift)
            if (isWeekend(date)) {
                // Check policy? Assuming standard M-F work week for now or just skip marking attendance on weekends
                // If we mark LEAVE on weekend, it might count as taken.
                // Let's skip weekends for attendance marking to be safe, unless it's a specific shift.
                continue;
            }

            await prisma.attendance.upsert({
                where: {
                    employeeId_date: {
                        employeeId: leave.employeeId,
                        date: date
                    }
                },
                create: {
                    employeeId: leave.employeeId,
                    date: date,
                    status: 'LEAVE',
                    attendanceType: 'REGULAR',
                    workingHours: 0,
                    remarks: `Approved Leave: ${leave.leaveType}`,
                },
                update: {
                    status: 'LEAVE',
                    remarks: `Approved Leave: ${leave.leaveType}`,
                }
            });
        }

        // 5. Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'LEAVE_APPROVED',
                entity: 'Leave',
                entityId: leave.id,
                details: JSON.stringify({ remarks: validated.remarks }),
            }
        });

        return NextResponse.json(updatedLeave);

    } catch (error: any) {
        console.error('[LEAVE_APPROVE_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
