import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const status = searchParams.get('status');
        const leaveType = searchParams.get('leaveType');
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        // RBAC: Employees can only view their own leaves
        // Managers/Admins can view others based on role (simplified here to allow if param provided, but ideally checked against hierarchy)
        if (session.user.role === 'EMPLOYEE') {
            if (employeeId && employeeId !== session.user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            // Force employeeId filter for employees
            if (!employeeId) {
                // If no employeeId provided, default to current user
                // But if they are trying to see "all", deny.
                // Let's just default to showing their own leaves.
            }
        }

        const whereClause: any = {};

        // Filter by Employee
        if (employeeId) {
            whereClause.employeeId = employeeId;
        } else if (session.user.role === 'EMPLOYEE') {
            whereClause.employeeId = session.user.id;
        }

        // Filter by Status
        if (status) {
            whereClause.status = status;
        }

        // Filter by Type
        if (leaveType) {
            whereClause.leaveType = leaveType;
        }

        // Filter by Date Range
        if (from || to) {
            whereClause.AND = [];
            if (from) {
                whereClause.AND.push({ startDate: { gte: new Date(from) } });
            }
            if (to) {
                whereClause.AND.push({ endDate: { lte: new Date(to) } });
            }
        }

        const leaves = await prisma.leave.findMany({
            where: whereClause,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeNumber: true,
                        department: true,
                    }
                },
                approver: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(leaves);

    } catch (error: any) {
        console.error('[LEAVE_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
