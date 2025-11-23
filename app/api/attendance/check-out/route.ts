import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * POST /api/attendance/check-out
 * Employee check-out
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, checkOutLocation } = body;

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId is required'
        },
        { status: 400 }
      );
    }

    const attendance = await attendanceService.checkOut(employeeId, checkOutLocation);

    let message = 'Checked out successfully';
    if (attendance.earlyOutBy && attendance.earlyOutBy > 0) {
      message += ` (Early out by ${attendance.earlyOutBy} minutes)`;
    }
    if (attendance.overtimeHours && attendance.overtimeHours > 0) {
      message += ` (Overtime: ${attendance.overtimeHours} hours)`;
    }

    return NextResponse.json({
      success: true,
      data: attendance,
      message
    });
  } catch (error: any) {
    console.error('Error during check-out:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check out'
      },
      { status: 400 }
    );
  }
}
