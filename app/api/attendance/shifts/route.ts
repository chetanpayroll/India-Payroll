import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * GET /api/attendance/shifts
 * Get all shifts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityId = searchParams.get('entityId');

    const shifts = await attendanceService.getShifts(entityId || undefined);

    return NextResponse.json({
      success: true,
      data: shifts,
      count: shifts.length
    });
  } catch (error: any) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch shifts'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/shifts
 * Create a new shift
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      entityId,
      shiftCode,
      shiftName,
      startTime,
      endTime,
      breakDuration,
      workingHours,
      lateGracePeriod,
      earlyOutGracePeriod,
      isNightShift,
      nightShiftAllowance,
      weeklyOffDays,
      overtimeApplicable,
      overtimeMultiplier
    } = body;

    if (!shiftCode || !shiftName || !startTime || !endTime || workingHours === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: shiftCode, shiftName, startTime, endTime, workingHours'
        },
        { status: 400 }
      );
    }

    const shift = await attendanceService.createShift({
      entityId,
      shiftCode,
      shiftName,
      startTime,
      endTime,
      breakDuration,
      workingHours: parseFloat(workingHours),
      lateGracePeriod,
      earlyOutGracePeriod,
      isNightShift,
      nightShiftAllowance,
      weeklyOffDays,
      overtimeApplicable,
      overtimeMultiplier
    });

    return NextResponse.json(
      {
        success: true,
        data: shift,
        message: 'Shift created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating shift:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create shift'
      },
      { status: 400 }
    );
  }
}
