import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * GET /api/attendance/overtime
 * Get overtime requests
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

    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const requests = await attendanceService.getOvertimeRequests(filters);

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error: any) {
    console.error('Error fetching overtime requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch overtime requests'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/overtime
 * Create overtime request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, overtimeDate, startTime, endTime, hours, reason } = body;

    if (!employeeId || !overtimeDate || !startTime || !endTime || !hours || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: employeeId, overtimeDate, startTime, endTime, hours, reason'
        },
        { status: 400 }
      );
    }

    const overtimeRequest = await attendanceService.createOvertimeRequest({
      employeeId,
      overtimeDate: new Date(overtimeDate),
      startTime,
      endTime,
      hours: parseFloat(hours),
      reason
    });

    return NextResponse.json(
      {
        success: true,
        data: overtimeRequest,
        message: 'Overtime request created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating overtime request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create overtime request'
      },
      { status: 400 }
    );
  }
}
