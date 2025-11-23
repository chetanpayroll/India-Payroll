import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * GET /api/attendance
 * Get attendance records with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: any = {};

    if (searchParams.get('employeeId')) {
      filters.employeeId = searchParams.get('employeeId');
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }

    if (searchParams.get('attendanceType')) {
      filters.attendanceType = searchParams.get('attendanceType');
    }

    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const attendance = await attendanceService.getAttendance(filters);

    return NextResponse.json({
      success: true,
      data: attendance,
      count: attendance.length
    });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch attendance records'
      },
      { status: 500 }
    );
  }
}
