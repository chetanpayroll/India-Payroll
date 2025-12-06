import { prisma } from '@/lib/prisma';
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isWeekend
} from 'date-fns';

type CheckBalanceResult = {
  sufficient: boolean;
  available: number; // days available after pending
  pending: number;
  message?: string;
};

export const leaveService = {
  /**
   * Calculate working days excluding weekends and holidays
   * - startDate / endDate may be Date or ISO string
   */
  async calculateWorkingDays(
    startDate: Date | string,
    endDate: Date | string,
    includeWeekends = false,
    includeHolidays = false
  ): Promise<number> {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    const days = eachDayOfInterval({ start, end });
    let workingDays = 0;

    // fetch holidays in the date range (assumes publicHoliday.date is a Date or a date string)
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: startOfDay(start),
          lte: endOfDay(end)
        }
      },
      select: { date: true } // only need the date field
    });

    const holidayDates = new Set(
      holidays.map(h => startOfDay(new Date(h.date)).getTime())
    );

    for (const day of days) {
      const dayStart = startOfDay(day);

      // Skip weekends if not included
      if (!includeWeekends && isWeekend(day)) continue;

      // Skip holidays if not included
      if (!includeHolidays && holidayDates.has(dayStart.getTime())) continue;

      workingDays++;
    }

    return workingDays;
  },

  /**
   * Check if employee has sufficient leave balance
   * - leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | others
   * - requestedDays: number of days employee is applying for
   *
   * Returns object with whether sufficient and numeric balances (pending & available).
   */
  async checkLeaveBalance(
    employeeId: string,
    leaveType: string,
    requestedDays: number
  ): Promise<CheckBalanceResult> {
    if (!employeeId) {
      return { sufficient: false, available: 0, pending: 0, message: 'Missing employeeId' };
    }

    // UNPAID is unlimited here
    if (leaveType === 'UNPAID') {
      return { sufficient: true, available: Number.POSITIVE_INFINITY, pending: 0 };
    }

    const currentYear = new Date().getFullYear();

    // find or create leave balance record for the employee+year
    let balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year: currentYear
        }
      }
    });

    // If no balance record, try to create one using policy defaults if possible
    if (!balance) {
      const policy = await prisma.leavePolicy.findFirst({
        where: { leaveType: leaveType as any, isActive: true }
      });

      // reasonable defaults (adjust to your org policy)
      const defaultAnnual = policy?.annualEntitlement ?? 30;
      const defaultSick = policy?.sickEntitlement ?? 15;

      balance = await prisma.leaveBalance.create({
        data: {
          employeeId,
          year: currentYear,
          annualLeaveEntitled: leaveType === 'ANNUAL' ? defaultAnnual : 0,
          annualLeaveBalance: leaveType === 'ANNUAL' ? defaultAnnual : 0,
          sickLeaveEntitled: leaveType === 'SICK' ? defaultSick : 0,
          sickLeaveBalance: leaveType === 'SICK' ? defaultSick : 0
        }
      });
    }

    // Calculate pending leaves (applied but not approved/rejected)
    const pendingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        leaveType: leaveType as any,
        status: 'PENDING'
      },
      select: { numberOfDays: true }
    });

    const pendingDays = pendingLeaves.reduce((s, r) => s + Number(r.numberOfDays || 0), 0);

    // determine DB balance based on leaveType
    let dbBalance = 0;
    switch (leaveType) {
      case 'ANNUAL':
        dbBalance = Number(balance.annualLeaveBalance ?? 0);
        break;
      case 'SICK':
        dbBalance = Number(balance.sickLeaveBalance ?? 0);
        break;
      default:
        // other leave types - you may want to handle differently
        return { sufficient: true, available: Number.POSITIVE_INFINITY, pending: pendingDays };
    }

    const effectiveBalance = dbBalance - pendingDays;

    if (requestedDays > effectiveBalance) {
      return {
        sufficient: false,
        available: Math.max(0, effectiveBalance),
        pending: pendingDays,
        message: `Insufficient ${leaveType.toLowerCase()} leave. Available: ${Math.max(0, effectiveBalance)} days (Pending: ${pendingDays})`
      };
    }

    return { sufficient: true, available: Math.max(0, effectiveBalance), pending: pendingDays };
  },

  /**
   * Check for overlapping leaves for given employee and date-range.
   * Returns whether overlap exists and the overlapping records.
   */
  async checkOverlappingLeaves(
    employeeId: string,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<{ hasOverlap: boolean; overlappingLeaves: any[] }> {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } }
        ]
      }
    });

    return { hasOverlap: overlappingLeaves.length > 0, overlappingLeaves };
  }
};

// Default export for convenience (so imports using default or named both work)
export default leaveService;
