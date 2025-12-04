import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const RejectSchema = z.object({
    reason: z.string().min(3, 'Rejection reason is required'),
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
        const validated = RejectSchema.parse(body);

        const leave = await prisma.leave.findUnique({
            where: { id }
        });

        if (!leave) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        if (leave.status !== 'PENDING') {
            return NextResponse.json({ error: `Leave is already ${leave.status}` }, { status: 400 });
        }

        // Update Status
        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedBy: session.user.id, // Using approvedBy field for rejector too
                approvedDate: new Date(),
                rejectionReason: validated.reason,
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'LEAVE_REJECTED',
                entity: 'Leave',
                entityId: leave.id,
                details: JSON.stringify({ reason: validated.reason }),
            }
        });

        return NextResponse.json(updatedLeave);

    } catch (error: any) {
        console.error('[LEAVE_REJECT_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
