import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, eachDayOfInterval, isWeekend, differenceInDays } from 'date-fns';

export const LeaveService = {
  /**
   * Calculate working days excluding weekends and holidays
   */
  async calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    employeeId: string,
    includeWeekends: boolean = false,
    includeHolidays: boolean = false
  ): Promise<number> {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let workingDays = 0;

    // Get holidays for the period
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      }
    });

    const holidayDates = new Set(
      holidays.map(h => startOfDay(h.date).getTime())
    );

    // Get employee shift for weekend definition (defaulting to Sat/Sun if no shift)
    // In a real scenario, we'd fetch the specific shift. For now, assuming standard weekends.
    // TODO: Fetch actual shift weeklyOffDays

    for (const day of days) {
      const dayStart = startOfDay(day);

      // Skip weekends if not included
      if (!includeWeekends && isWeekend(day)) {
        continue;
      }

      // Skip holidays if not included
      if (!includeHolidays && holidayDates.has(dayStart.getTime())) {
        continue;
      }

      workingDays++;
    }

    return workingDays;
  },

  /**
   * Check if employee has sufficient leave balance
   * Considers PENDING leaves to prevent over-application
   */
  async checkLeaveBalance(
    employeeId: string,
    leaveType: string,
    requestedDays: number
  ): Promise<{ sufficient: boolean; available: number; pending: number; message?: string }> {

    // Unpaid leave always available
    if (leaveType === 'UNPAID') {
      return { sufficient: true, available: Infinity, pending: 0 };
    }

    const currentYear = new Date().getFullYear();

    // 1. Get actual DB balance
    let balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year: currentYear
        }
      }
    });

    // Create balance record if it doesn't exist
    if (!balance) {
      const policy = await prisma.leavePolicy.findFirst({
        where: { leaveType: leaveType as any, isActive: true }
      });

      balance = await prisma.leaveBalance.create({
        data: {
          employeeId,
          year: currentYear,
          annualLeaveEntitled: leaveType === 'ANNUAL' ? (policy?.annualEntitlement || 30) : 0,
          annualLeaveBalance: leaveType === 'ANNUAL' ? (policy?.annualEntitlement || 30) : 0,
          sickLeaveEntitled: leaveType === 'SICK' ? 15 : 0,
          sickLeaveBalance: leaveType === 'SICK' ? 15 : 0,
        }
      });
    }

    // 2. Calculate Pending Leaves (Applied but not yet approved/rejected)
    // We must subtract these to show "Effective Available Balance"
    const pendingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        leaveType: leaveType as any,
        status: 'PENDING',
        // Exclude the current leave if we were checking an update, but here we assume new application
      }
    });

    const pendingDays = pendingLeaves.reduce((sum, leave) => sum + Number(leave.numberOfDays), 0);

    // 3. Determine Available Balance
    let dbBalance = 0;
    switch (leaveType) {
      case 'ANNUAL':
        dbBalance = Number(balance.annualLeaveBalance);
        break;
      case 'SICK':
        dbBalance = Number(balance.sickLeaveBalance);
        break;
      default:
        // For other types, check if there's a specific limit or default to allowed
        return { sufficient: true, available: Infinity, pending: pendingDays };
    }

    const effectiveBalance = dbBalance - pendingDays;

    if (requestedDays > effectiveBalance) {
      return {
        sufficient: false,
        available: effectiveBalance,
        pending: pendingDays,
        message: `Insufficient ${leaveType.toLowerCase()} leave balance. Available: ${effectiveBalance} days (Pending: ${pendingDays})`
      };
    }

    return { sufficient: true, available: effectiveBalance, pending: pendingDays };
  },

  /**
   * Check for overlapping leaves
   */
  async checkOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ hasOverlap: boolean; overlappingLeaves: any[] }> {

    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: {
          in: ['PENDING', 'APPROVED']
        },
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          }
        ]
      }
    });

    return {
      hasOverlap: overlappingLeaves.length > 0,
      overlappingLeaves
    };
  }
};
