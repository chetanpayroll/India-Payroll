import { NextRequest, NextResponse } from 'next/server';
import { leaveService } from '@/lib/services/leave-service';

/**
 * GET /api/leave/balance?employeeId=xxx&year=2024
 * Get leave balance for an employee
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId is required'
        },
        { status: 400 }
      );
    }

    const balance = await leaveService.getLeaveBalance(
      employeeId,
      year ? parseInt(year) : undefined
    );

    return NextResponse.json({
      success: true,
      data: balance
    });
  } catch (error: any) {
    console.error('Error fetching leave balance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leave balance'
      },
      { status: 500 }
    );
  }
}
