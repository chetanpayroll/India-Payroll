import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AttendanceService } from '@/lib/services/attendance-service';
import { z } from 'zod';

const PunchOutSchema = z.object({
    employeeId: z.string().cuid(),
    location: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validated = PunchOutSchema.parse(body);

        if (session.user.role === 'EMPLOYEE' && validated.employeeId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const attendance = await AttendanceService.punchOut(validated.employeeId, validated.location);

        return NextResponse.json({
            success: true,
            message: 'Punched out successfully',
            attendance
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
