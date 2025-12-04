import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await prisma.overtimeRequest.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedBy: session.user.id,
        approvedDate: new Date(),
      }
    });

    // Optionally update Attendance record to reflect OT hours if not already there
    // But usually OT request is separate for payout.

    return NextResponse.json(updated);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
