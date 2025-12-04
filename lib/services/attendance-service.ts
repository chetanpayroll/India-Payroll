import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, differenceInMinutes, parse, addMinutes, subMinutes } from 'date-fns';

export const AttendanceService = {
  /**
   * Punch In for an employee
   */
  async punchIn(employeeId: string, location?: { latitude?: number; longitude?: number; address?: string }) {
    const today = startOfDay(new Date());
    const now = new Date();

    // 1. Check existing
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    if (existing?.checkInTime) {
      throw new Error('Already punched in today');
    }

    // 2. Get Shift
    const employeeShift = await prisma.employeeShift.findFirst({
      where: {
        employeeId,
        isActive: true,
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }]
      },
      include: { shift: true }
    });

    const shift = employeeShift?.shift;
    if (!shift) {
      throw new Error('No active shift found');
    }

    // 3. Calculate Late
    const shiftStart = parse(shift.startTime, 'HH:mm', today);
    const graceEnd = addMinutes(shiftStart, shift.lateGracePeriod);
    const isLate = now > graceEnd;
    const lateBy = isLate ? differenceInMinutes(now, shiftStart) : 0;

    // 4. Create Attendance
    return await prisma.attendance.upsert({
      where: {
        employeeId_date: { employeeId, date: today }
      },
      create: {
        employeeId,
        date: today,
        shiftId: shift.id,
        checkInTime: now,
        checkInLocation: location ? JSON.stringify(location) : null,
        status: isLate ? 'LATE' : 'PRESENT',
        attendanceType: isLate ? 'LATE' : 'REGULAR',
        lateBy: isLate ? lateBy : null,
        isManualEntry: false
      },
      update: {
        checkInTime: now,
        checkInLocation: location ? JSON.stringify(location) : null,
        status: isLate ? 'LATE' : 'PRESENT',
        attendanceType: isLate ? 'LATE' : 'REGULAR',
        lateBy: isLate ? lateBy : null,
      }
    });
  },

  /**
   * Punch Out for an employee
   */
  async punchOut(employeeId: string, location?: { latitude?: number; longitude?: number; address?: string }) {
    const today = startOfDay(new Date());
    const now = new Date();

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId, date: today }
      },
      include: { shift: true }
    });

    if (!attendance || !attendance.checkInTime) {
      throw new Error('No punch-in record found');
    }

    if (attendance.checkOutTime) {
      throw new Error('Already punched out');
    }

    const shift = attendance.shift;
    if (!shift) throw new Error('Shift not found');

    // Calculate Hours
    const totalMinutes = differenceInMinutes(now, attendance.checkInTime);
    const workingHours = Number(Math.max(0, (totalMinutes - shift.breakDuration) / 60).toFixed(2));

    // Calculate Overtime
    const expectedHours = Number(shift.workingHours);
    const overtimeHours = Math.max(0, workingHours - expectedHours);

    // Calculate Early Out
    const shiftEnd = parse(shift.endTime, 'HH:mm', today);
    const earlyOutThreshold = subMinutes(shiftEnd, shift.earlyOutGracePeriod);
    const isEarlyOut = now < earlyOutThreshold;
    const earlyOutBy = isEarlyOut ? differenceInMinutes(shiftEnd, now) : 0;

    // Determine Status
    let status = attendance.status;
    let type = attendance.attendanceType;

    if (isEarlyOut) {
      status = 'EARLY_OUT';
      type = 'EARLY_OUT';
    } else if (overtimeHours > 0 && type !== 'LATE') {
      type = 'OVERTIME';
    }

    if (workingHours < expectedHours / 2) {
      status = 'HALF_DAY';
    }

    return await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        checkOutLocation: location ? JSON.stringify(location) : null,
        workingHours,
        overtimeHours: overtimeHours > 0 ? overtimeHours : null,
        earlyOutBy: isEarlyOut ? earlyOutBy : null,
        status,
        attendanceType: type
      }
    });
  },

  /**
   * Get History
   */
  async getHistory(employeeId: string, from: Date, to: Date) {
    return await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: from, lte: to }
      },
      include: { shift: true },
      orderBy: { date: 'desc' }
    });
  }
};
