import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (session.user.role === 'EMPLOYEE') {
      if (employeeId && employeeId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const whereClause: any = {};

    if (employeeId) {
      whereClause.employeeId = employeeId;
    } else if (session.user.role === 'EMPLOYEE') {
      whereClause.employeeId = session.user.id;
    }

    if (from && to) {
      whereClause.date = {
        gte: new Date(from),
        lte: new Date(to)
      };
    } else if (month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      whereClause.date = {
        gte: startOfMonth(date),
        lte: endOfMonth(date)
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        },
        shift: {
          select: {
            shiftName: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(attendance);

  } catch (error: any) {
    console.error('[ATTENDANCE_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
