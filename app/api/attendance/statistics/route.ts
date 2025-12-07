import { NextRequest, NextResponse } from 'next/server';
import { attendanceService } from '@/lib/services/attendance-service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/attendance/statistics
 * Get attendance statistics for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : undefined;

    const statistics = await attendanceService.getAttendanceStatistics(date);

    return NextResponse.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error('Error fetching attendance statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch attendance statistics'
      },
      { status: 500 }
    );
  }
}
