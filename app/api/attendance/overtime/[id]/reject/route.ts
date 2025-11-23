import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * POST /api/attendance/overtime/[id]/reject
 * Reject overtime request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rejectionReason } = body;

    if (!rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          error: 'rejectionReason is required'
        },
        { status: 400 }
      );
    }

    const overtimeRequest = await attendanceService.rejectOvertimeRequest(
      params.id,
      rejectionReason
    );

    return NextResponse.json({
      success: true,
      data: overtimeRequest,
      message: 'Overtime request rejected'
    });
  } catch (error: any) {
    console.error('Error rejecting overtime request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reject overtime request'
      },
      { status: 400 }
    );
  }
}
