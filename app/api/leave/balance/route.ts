export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // RBAC: Employees can only view their own balance
    if (session.user.role === 'EMPLOYEE' && employeeId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year
        }
      }
    });

    // If no balance record exists, return default/zero structure or create one?
    // Better to return defaults if not found, or create on the fly if policy exists.
    // For now, return null or empty object if not found, frontend handles it.
    if (!balance) {
      // Try to create one based on policy if it's the current year?
      // Or just return empty.
      return NextResponse.json({
        annualLeaveEntitled: 0,
        annualLeaveBalance: 0,
        sickLeaveEntitled: 0,
        sickLeaveBalance: 0,
        message: "No balance record found for this year"
      });
    }

    return NextResponse.json(balance);

  } catch (error: any) {
    console.error('[LEAVE_BALANCE_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
