import { NextRequest, NextResponse } from 'next/server';
import { leaveService } from '@/lib/services/leave-service';

/**
 * GET /api/leave/requests/[id]
 * Get a specific leave request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leave = await leaveService.getLeaveRequestById(params.id);

    return NextResponse.json({
      success: true,
      data: leave
    });
  } catch (error: any) {
    console.error('Error fetching leave request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Leave request not found'
      },
      { status: 404 }
    );
  }
}

/**
 * DELETE /api/leave/requests/[id]
 * Cancel a leave request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID is required'
        },
        { status: 400 }
      );
    }

    const leave = await leaveService.cancelLeaveRequest(params.id, employeeId);

    return NextResponse.json({
      success: true,
      data: leave,
      message: 'Leave request cancelled successfully'
    });
  } catch (error: any) {
    console.error('Error cancelling leave request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to cancel leave request'
      },
      { status: 400 }
    );
  }
}
