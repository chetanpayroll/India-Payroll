import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, eachDayOfInterval, isWeekend } from 'date-fns';

type CheckBalanceResult = {
  sufficient: boolean;
  available: number;
  pending: number;
  message?: string;
};

export const leaveService = {
  async calculateWorkingDays(startDate: Date | string, endDate: Date | string, includeWeekends = false, includeHolidays = false): Promise<number> {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const days = eachDayOfInterval({ start, end });
    let workingDays = 0;

    // Check if publicHoliday model exists, else skip holiday check
    let holidayDates = new Set();

    // @ts-ignore: checking for model existence safely
    if (prisma.publicHoliday) {
      // @ts-ignore
      const holidays = await prisma.publicHoliday.findMany({ where: { date: { gte: startOfDay(start), lte: endOfDay(end) } }, select: { date: true } });
      holidayDates = new Set(holidays.map((h: any) => startOfDay(new Date(h.date)).getTime()));
    }

    for (const day of days) {
      const dayStart = startOfDay(day);
      if (!includeWeekends && isWeekend(day)) continue;
      if (!includeHolidays && holidayDates.has(dayStart.getTime())) continue;
      workingDays++;
    }

    return workingDays;
  },

  async checkLeaveBalance(employeeId: string, leaveType: string, requestedDays: number): Promise<CheckBalanceResult> {
    if (!employeeId) return { sufficient: false, available: 0, pending: 0, message: 'Missing employeeId' };
    if (leaveType === 'UNPAID') return { sufficient: true, available: Number.POSITIVE_INFINITY, pending: 0 };

    const currentYear = new Date().getFullYear();

    // Trying to map string leaveType to UUID if possible, or querying assuming joined structure
    // Since schema uses `LeaveType` relation, we first need the ID for 'leaveType' name
    const leaveTypeRecord = await prisma.leaveType.findFirst({
      where: { name: leaveType }
    });

    // If we can't find the leave type definition, we can't check standard balance
    // Fallback to "sufficient" for now or error
    if (!leaveTypeRecord) {
      // Fallback: Check if user wants us to trust Unpaid/Special without record
      return { sufficient: true, available: 0, pending: 0, message: 'Leave type not found in system' };
    }

    let balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        year: currentYear,
        leaveTypeId: leaveTypeRecord.id
      }
    });

    // Calculate pending from applications
    const pendingLeaves = await prisma.leaveApplication.findMany({
      where: {
        employeeId,
        leaveTypeId: leaveTypeRecord.id, // Using correct ID
        status: 'Pending'
      },
      select: { totalDays: true }
    });
    const pendingDays = pendingLeaves.reduce((s, r) => s + Number(r.totalDays || 0), 0);

    const dbBalance = Number(balance?.closingBalance ?? 0);
    const effectiveBalance = dbBalance - pendingDays;

    if (requestedDays > effectiveBalance) {
      return {
        sufficient: false,
        available: Math.max(0, effectiveBalance),
        pending: pendingDays,
        message: `Insufficient ${leaveType.toLowerCase()} leave. Available: ${Math.max(0, effectiveBalance)} (Pending: ${pendingDays})`
      };
    }

    return { sufficient: true, available: Math.max(0, effectiveBalance), pending: pendingDays };
  },

  async checkOverlappingLeaves(employeeId: string, startDate: Date | string, endDate: Date | string) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    // Updated to match actual schema `LeaveApplication` and fields `fromDate`, `toDate`
    const overlappingLeaves = await prisma.leaveApplication.findMany({
      where: {
        employeeId,
        status: { in: ['Pending', 'Approved'] },
        AND: [
          { fromDate: { lte: end } },
          { toDate: { gte: start } }
        ]
      }
    });
    return { hasOverlap: overlappingLeaves.length > 0, overlappingLeaves };
  }
};

export default leaveService;
