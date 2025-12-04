/**
 * Leave Application API - POST /api/leave/apply
 * Enterprise Payroll System - Leave Management
 * 
 * This endpoint handles leave application submissions with comprehensive validation:
 * - Balance validation
 * - Overlapping leave detection
 * - Working days calculation
 * - Policy compliance checks
 * - Audit logging
 * - Notification triggers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { startOfDay, endOfDay, eachDayOfInterval, isWeekend, differenceInDays } from 'date-fns';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const LeaveApplicationSchema = z.object({
    employeeId: z.string().cuid(),
    leaveType: z.enum(['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY', 'COMPASSIONATE', 'STUDY', 'HAJJ']),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    halfDay: z.boolean().optional().default(false),
    attachments: z.array(z.string()).optional(),
});

type LeaveApplication = z.infer<typeof LeaveApplicationSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate working days excluding weekends and holidays
 */
async function calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    employeeId: string,
    includeWeekends: boolean = false,
    includeHolidays: boolean = false
): Promise<number> {

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let workingDays = 0;

    // Get holidays for the period
    const holidays = await prisma.publicHoliday.findMany({
        where: {
            date: {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate)
            }
        }
    });

    const holidayDates = new Set(
        holidays.map(h => startOfDay(h.date).getTime())
    );

    for (const day of days) {
        const dayStart = startOfDay(day);

        // Skip weekends if not included
        if (!includeWeekends && isWeekend(day)) {
            continue;
        }

        // Skip holidays if not included
        if (!includeHolidays && holidayDates.has(dayStart.getTime())) {
            continue;
        }

        workingDays++;
    }

    return workingDays;
}

/**
 * Check if employee has sufficient leave balance
 */
async function checkLeaveBalance(
    employeeId: string,
    leaveType: string,
    requestedDays: number
): Promise<{ sufficient: boolean; available: number; message?: string }> {

    // Unpaid leave always available
    if (leaveType === 'UNPAID') {
        return { sufficient: true, available: Infinity };
    }

    const currentYear = new Date().getFullYear();

    // Get leave balance
    let balance = await prisma.leaveBalance.findUnique({
        where: {
            employeeId_year: {
                employeeId,
                year: currentYear
            }
        }
    });

    // Create balance if not exists
    if (!balance) {
        const policy = await prisma.leavePolicy.findFirst({
            where: { leaveType, isActive: true }
        });

        balance = await prisma.leaveBalance.create({
            data: {
                employeeId,
                year: currentYear,
                annualLeaveEntitled: leaveType === 'ANNUAL' ? (policy?.annualEntitlement || 30) : 0,
                annualLeaveBalance: leaveType === 'ANNUAL' ? (policy?.annualEntitlement || 30) : 0,
                sickLeaveEntitled: leaveType === 'SICK' ? 15 : 0,
                sickLeaveBalance: leaveType === 'SICK' ? 15 : 0,
            }
        });
    }

    // Check balance based on leave type
    let available = 0;
    switch (leaveType) {
        case 'ANNUAL':
            available = Number(balance.annualLeaveBalance);
            break;
        case 'SICK':
            available = Number(balance.sickLeaveBalance);
            break;
        default:
            // Other leave types may have different logic or unlimited
            return { sufficient: true, available: Infinity };
    }

    if (requestedDays > available) {
        return {
            sufficient: false,
            available,
            message: `Insufficient ${leaveType.toLowerCase()} leave balance. Available: ${available} days`
        };
    }

    return { sufficient: true, available };
}

/**
 * Check for overlapping leaves
 */
async function checkOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date
): Promise<{ hasOverlap: boolean; overlappingLeaves: any[] }> {

    const overlappingLeaves = await prisma.leave.findMany({
        where: {
            employeeId,
            status: {
                in: ['PENDING', 'APPROVED']
            },
            OR: [
                {
                    AND: [
                        { startDate: { lte: endDate } },
                        { endDate: { gte: startDate } }
                    ]
                }
            ]
        }
    });

    return {
        hasOverlap: overlappingLeaves.length > 0,
        overlappingLeaves
    };
}

/**
 * Get leave policy for validation
 */
async function getLeavePolicy(leaveType: string, entityId?: string) {
    return await prisma.leavePolicy.findFirst({
        where: {
            leaveType,
            isActive: true,
            ...(entityId ? { entityId } : {})
        }
    });
}

/**
 * Create audit log
 */
async function createAuditLog(action: string, entityId: string, performedBy: string, details?: any) {
    await prisma.auditLog.create({
        data: {
            userId: performedBy,
            action,
            entity: 'Leave',
            entityId,
            details: JSON.stringify(details),
            ipAddress: null, // Can be extracted from request
            userAgent: null,  // Can be extracted from request
        }
    });
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        // 1. AUTHENTICATION CHECK
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // 2. PARSE AND VALIDATE REQUEST BODY
        const body = await request.json();
        const validated = LeaveApplicationSchema.parse(body);

        // 3. AUTHORIZATION CHECK
        // Employees can only apply for their own leave
        if (session.user.role === 'EMPLOYEE' && validated.employeeId !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden. You can only apply leave for yourself.' },
                { status: 403 }
            );
        }

        // 4. DATE VALIDATION
        const startDate = new Date(validated.startDate);
        const endDate = new Date(validated.endDate);
        const today = startOfDay(new Date());

        if (startDate > endDate) {
            return NextResponse.json(
                { error: 'Start date must be before or equal to end date' },
                { status: 400 }
            );
        }

        // Cannot apply for past dates (except certain leave types)
        if (startDate < today && !['SICK', 'EMERGENCY'].includes(validated.leaveType)) {
            return NextResponse.json(
                { error: 'Cannot apply for past dates for this leave type' },
                { status: 400 }
            );
        }

        // 5. GET EMPLOYEE AND POLICY
        const employee = await prisma.employee.findUnique({
            where: { id: validated.employeeId },
            include: { entity: true }
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        const policy = await getLeavePolicy(validated.leaveType, employee.entityId);

        // 6. CALCULATE WORKING DAYS
        const workingDays = validated.halfDay
            ? 0.5
            : await calculateWorkingDays(
                startDate,
                endDate,
                validated.employeeId,
                policy?.includeWeekends,
                policy?.includeHolidays
            );

        // 7. POLICY VALIDATIONS
        if (policy) {
            // Check minimum days per request
            if (workingDays < Number(policy.minDaysPerRequest)) {
                return NextResponse.json(
                    { error: `Minimum ${policy.minDaysPerRequest} days required for this leave type` },
                    { status: 400 }
                );
            }

            // Check maximum days per request
            if (policy.maxDaysPerRequest && workingDays > Number(policy.maxDaysPerRequest)) {
                return NextResponse.json(
                    { error: `Maximum ${policy.maxDaysPerRequest} days allowed per request` },
                    { status: 400 }
                );
            }

            // Check advance notice
            const daysUntilLeave = differenceInDays(startDate, today);
            if (daysUntilLeave < policy.advanceNoticeDays && validated.leaveType !== 'EMERGENCY') {
                return NextResponse.json(
                    { error: `Minimum ${policy.advanceNoticeDays} days advance notice required` },
                    { status: 400 }
                );
            }
        }

        // 8. CHECK LEAVE BALANCE
        const balanceCheck = await checkLeaveBalance(
            validated.employeeId,
            validated.leaveType,
            workingDays
        );

        if (!balanceCheck.sufficient) {
            return NextResponse.json(
                {
                    error: balanceCheck.message,
                    available: balanceCheck.available,
                    requested: workingDays
                },
                { status: 400 }
            );
        }

        // 9. CHECK OVERLAPPING LEAVES
        const overlapCheck = await checkOverlappingLeaves(
            validated.employeeId,
            startDate,
            endDate
        );

        if (overlapCheck.hasOverlap) {
            return NextResponse.json(
                {
                    error: 'Leave request overlaps with existing leave',
                    overlapping: overlapCheck.overlappingLeaves.map(l => ({
                        id: l.id,
                        type: l.leaveType,
                        startDate: l.startDate,
                        endDate: l.endDate,
                        status: l.status
                    }))
                },
                { status: 400 }
            );
        }

        // 10. CREATE LEAVE APPLICATION
        const leave = await prisma.leave.create({
            data: {
                employeeId: validated.employeeId,
                leaveType: validated.leaveType,
                startDate,
                endDate,
                numberOfDays: workingDays,
                reason: validated.reason,
                attachmentUrl: validated.attachments?.join(','),
                status: 'PENDING',
                appliedDate: new Date(),
                currentApprovalLevel: 1,
                // Initialize approval chain (can be expanded)
                approvalChain: {
                    chain: [
                        {
                            level: 1,
                            role: 'MANAGER',
                            status: 'PENDING'
                        }
                    ]
                }
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeNumber: true,
                        department: true,
                        designation: true
                    }
                }
            }
        });

        // 11. CREATE AUDIT LOG
        await createAuditLog(
            'LEAVE_APPLIED',
            leave.id,
            session.user.id,
            {
                leaveType: validated.leaveType,
                duration: workingDays,
                startDate,
                endDate
            }
        );

        // 12. TODO: SEND NOTIFICATION TO MANAGER
        // await sendLeaveNotification(leave);

        // 13. RETURN SUCCESS RESPONSE
        return NextResponse.json({
            success: true,
            message: 'Leave application submitted successfully',
            leave: {
                id: leave.id,
                leaveType: leave.leaveType,
                startDate: leave.startDate,
                endDate: leave.endDate,
                numberOfDays: leave.numberOfDays,
                status: leave.status,
                appliedDate: leave.appliedDate,
                employee: leave.employee
            },
            balanceRemaining: balanceCheck.available - workingDays
        }, { status: 201 });

    } catch (error: any) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        // Log error and return generic message
        console.error('[LEAVE_APPLICATION_ERROR]', error);

        return NextResponse.json(
            {
                error: 'Failed to submit leave application',
                message: error.message || 'Internal server error'
            },
            { status: 500 }
        );
    }
}
