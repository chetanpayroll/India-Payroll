import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

/**
 * POST /api/attendance/overtime/[id]/approve
 * Approve overtime request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { approvedBy, overtimeRate } = body;

    if (!approvedBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'approvedBy is required'
        },
        { status: 400 }
      );
    }

    const overtimeRequest = await attendanceService.approveOvertimeRequest(
      params.id,
      approvedBy,
      overtimeRate ? parseFloat(overtimeRate) : undefined
    );

    return NextResponse.json({
      success: true,
      data: overtimeRequest,
      message: 'Overtime request approved successfully'
    });
  } catch (error: any) {
    console.error('Error approving overtime request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to approve overtime request'
      },
      { status: 400 }
    );
  }
}
