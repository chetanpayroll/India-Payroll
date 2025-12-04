import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OvertimeSchema = z.object({
    employeeId: z.string().cuid(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    hours: z.number().min(0.5),
    reason: z.string().min(5),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validated = OvertimeSchema.parse(body);

        if (session.user.role === 'EMPLOYEE' && validated.employeeId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const otRequest = await prisma.overtimeRequest.create({
            data: {
                employeeId: validated.employeeId,
                overtimeDate: new Date(validated.date),
                hours: validated.hours,
                reason: validated.reason,
                status: 'PENDING',
                requestDate: new Date(),
            }
        });

        return NextResponse.json(otRequest);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
