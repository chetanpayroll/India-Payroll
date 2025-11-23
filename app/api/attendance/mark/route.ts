import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * POST /api/attendance/mark
 * Manual attendance marking (by HR/Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      employeeId,
      date,
      shiftId,
      checkInTime,
      checkOutTime,
      checkInLocation,
      checkOutLocation,
      status,
      attendanceType,
      remarks,
      isManualEntry,
      enteredBy
    } = body;

    if (!employeeId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId and date are required'
        },
        { status: 400 }
      );
    }

    const attendance = await attendanceService.markAttendance({
      employeeId,
      date: new Date(date),
      shiftId,
      checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      checkInLocation,
      checkOutLocation,
      status,
      attendanceType,
      remarks,
      isManualEntry: isManualEntry !== false,
      enteredBy
    });

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        message: 'Attendance marked successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to mark attendance'
      },
      { status: 400 }
    );
  }
}
