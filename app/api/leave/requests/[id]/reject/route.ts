import { NextRequest, NextResponse } from 'next/server';
import { leaveService } from '@/lib/services/leave-service';

/**
 * POST /api/leave/requests/[id]/reject
 * Reject a leave request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { approvedBy, rejectionReason } = body;

    if (!approvedBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'approvedBy is required'
        },
        { status: 400 }
      );
    }

    if (!rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          error: 'rejectionReason is required'
        },
        { status: 400 }
      );
    }

    const leave = await leaveService.rejectLeaveRequest(params.id, {
      approvedBy,
      rejectionReason
    });

    return NextResponse.json({
      success: true,
      data: leave,
      message: 'Leave request rejected'
    });
  } catch (error: any) {
    console.error('Error rejecting leave request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reject leave request'
      },
      { status: 400 }
    );
  }
}
