import { NextRequest, NextResponse } from 'next/server';
import { leaveService } from '@/lib/services/leave-service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/leave/statistics
 * Get leave statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: any = {};

    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const statistics = await leaveService.getLeaveStatistics(filters);

    return NextResponse.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error('Error fetching leave statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leave statistics'
      },
      { status: 500 }
    );
  }
}
