import { NextRequest, NextResponse } from 'next/server';
import { leaveService } from '@/lib/services/leave-service';

/**
 * POST /api/leave/requests/[id]/approve
 * Approve a leave request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { approvedBy } = body;

    if (!approvedBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'approvedBy is required'
        },
        { status: 400 }
      );
    }

    const leave = await leaveService.approveLeaveRequest(params.id, { approvedBy });

    return NextResponse.json({
      success: true,
      data: leave,
      message: 'Leave request approved successfully'
    });
  } catch (error: any) {
    console.error('Error approving leave request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to approve leave request'
      },
      { status: 400 }
    );
  }
}
