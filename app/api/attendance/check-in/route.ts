import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * POST /api/attendance/check-in
 * Employee check-in
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, checkInLocation } = body;

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId is required'
        },
        { status: 400 }
      );
    }

    const attendance = await attendanceService.checkIn(employeeId, checkInLocation);

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        message: attendance.lateBy
          ? `Checked in successfully (Late by ${attendance.lateBy} minutes)`
          : 'Checked in successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during check-in:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check in'
      },
      { status: 400 }
    );
  }
}
