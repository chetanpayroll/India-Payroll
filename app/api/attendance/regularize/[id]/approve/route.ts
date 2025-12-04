import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { differenceInMinutes } from 'date-fns';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role === 'EMPLOYEE') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const attendance = await prisma.attendance.findUnique({
            where: { id: params.id },
            include: { shift: true }
        });

        if (!attendance) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Recalculate working hours based on the regularized times
        let workingHours = 0;
        if (attendance.checkInTime && attendance.checkOutTime) {
            const totalMinutes = differenceInMinutes(new Date(attendance.checkOutTime), new Date(attendance.checkInTime));
            const breakDuration = attendance.shift?.breakDuration || 60;
            workingHours = Number(Math.max(0, (totalMinutes - breakDuration) / 60).toFixed(2));
        }

        const updated = await prisma.attendance.update({
            where: { id: params.id },
            data: {
                requiresApproval: false,
                status: 'PRESENT', // Confirm status
                workingHours,
                remarks: attendance.remarks + ' [APPROVED]'
            }
        });

        return NextResponse.json(updated);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
