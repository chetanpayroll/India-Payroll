import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AssignShiftSchema = z.object({
    employeeId: z.string().cuid(),
    shiftId: z.string().cuid(),
    effectiveFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role === 'EMPLOYEE') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = AssignShiftSchema.parse(body);

        // Deactivate current active shift
        await prisma.employeeShift.updateMany({
            where: {
                employeeId: validated.employeeId,
                isActive: true
            },
            data: {
                isActive: false,
                effectiveTo: new Date(validated.effectiveFrom) // End previous shift day before? Or same day?
                // Logic: End previous shift on the day before effectiveFrom
            }
        });

        // Create new assignment
        const assignment = await prisma.employeeShift.create({
            data: {
                employeeId: validated.employeeId,
                shiftId: validated.shiftId,
                effectiveFrom: new Date(validated.effectiveFrom),
                isActive: true
            }
        });

        return NextResponse.json(assignment);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
