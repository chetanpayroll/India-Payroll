import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * POST /api/attendance/shifts/assign
 * Assign shift to employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, shiftId, effectiveFrom, effectiveTo } = body;

    if (!employeeId || !shiftId || !effectiveFrom) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId, shiftId, and effectiveFrom are required'
        },
        { status: 400 }
      );
    }

    const employeeShift = await attendanceService.assignShift(
      employeeId,
      shiftId,
      new Date(effectiveFrom),
      effectiveTo ? new Date(effectiveTo) : undefined
    );

    return NextResponse.json(
      {
        success: true,
        data: employeeShift,
        message: 'Shift assigned successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error assigning shift:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to assign shift'
      },
      { status: 400 }
    );
  }
}
