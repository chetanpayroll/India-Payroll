import { NextRequest, NextResponse } from 'next/server';
import { leaveService } from '@/lib/services/leave-service';

/**
 * GET /api/leave/requests
 * Get all leave requests with optional filtering
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

    if (searchParams.get('leaveType')) {
      filters.leaveType = searchParams.get('leaveType');
    }

    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const leaves = await leaveService.getLeaveRequests(filters);

    return NextResponse.json({
      success: true,
      data: leaves,
      count: leaves.length
    });
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leave requests'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leave/requests
 * Create a new leave request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { employeeId, leaveType, startDate, endDate, numberOfDays, reason, attachmentUrl } = body;

    // Validation
    if (!employeeId || !leaveType || !startDate || !endDate || !numberOfDays) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: employeeId, leaveType, startDate, endDate, numberOfDays'
        },
        { status: 400 }
      );
    }

    const leave = await leaveService.createLeaveRequest({
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      numberOfDays: parseFloat(numberOfDays),
      reason,
      attachmentUrl
    });

    return NextResponse.json(
      {
        success: true,
        data: leave,
        message: 'Leave request created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create leave request'
      },
      { status: 400 }
    );
  }
}
