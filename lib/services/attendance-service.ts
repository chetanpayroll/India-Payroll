// /lib/services/attendance-service.ts
import { prisma } from '@/lib/prisma';
import {
  startOfDay,
  endOfDay,
  differenceInMinutes,
  parse,
  addMinutes,
  subMinutes
} from 'date-fns';

type Location = { latitude?: number; longitude?: number; address?: string } | undefined;

export const AttendanceService = {
  /**
   * Punch In for an employee
   */
  async punchIn(employeeId: string, location?: Location) {
    const today = startOfDay(new Date());
    const now = new Date();

    // 1. Check existing attendance row for today
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

    // 2. Get employee active shift (closest match)
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

    // 3. Calculate late
    const shiftStart = parse(shift.startTime, 'HH:mm', today);
    const graceEnd = addMinutes(shiftStart, Number(shift.lateGracePeriod ?? 0));
    const isLate = now > graceEnd;
    const lateBy = isLate ? differenceInMinutes(now, shiftStart) : 0;

    // 4. Upsert attendance record
    const attendance = await prisma.attendance.upsert({
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
        // If record exists but no checkInTime, update. If exists with checkInTime we already returned earlier.
        checkInTime: now,
        checkInLocation: location ? JSON.stringify(location) : null,
        status: isLate ? 'LATE' : 'PRESENT',
        attendanceType: isLate ? 'LATE' : 'REGULAR',
        lateBy: isLate ? lateBy : null
      }
    });

    return attendance;
  },

  /**
   * Punch Out for an employee
   */
  async punchOut(employeeId: string, location?: Location) {
    const today = startOfDay(new Date());
    const now = new Date();

    // find today's attendance
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

    // Calculate total minutes worked (from checkInTime to now)
    const totalMinutes = differenceInMinutes(now, attendance.checkInTime);
    // subtract break duration (ensure numeric)
    const breakDuration = Number(shift.breakDuration ?? 0);
    const workedMinutes = Math.max(0, totalMinutes - breakDuration);
    const workingHours = Number((workedMinutes / 60).toFixed(2));

    // expected working hours
    const expectedHours = Number(shift.workingHours ?? 0);
    const overtimeHours = Math.max(0, Number((workingHours - expectedHours).toFixed(2)));

    // early out detection
    const shiftEnd = parse(shift.endTime, 'HH:mm', today);
    const earlyOutThreshold = subMinutes(shiftEnd, Number(shift.earlyOutGracePeriod ?? 0));
    const isEarlyOut = now < earlyOutThreshold;
    const earlyOutBy = isEarlyOut ? differenceInMinutes(shiftEnd, now) : 0;

    // Determine status/type
    let status = attendance.status ?? 'PRESENT';
    let type = attendance.attendanceType ?? 'REGULAR';

    if (isEarlyOut) {
      status = 'EARLY_OUT';
      type = 'EARLY_OUT';
    } else if (overtimeHours > 0 && type !== 'LATE') {
      type = 'OVERTIME';
    }

    if (workingHours < expectedHours / 2) {
      status = 'HALF_DAY';
    }

    const updated = await prisma.attendance.update({
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

    return updated;
  },

  /**
   * Get attendance history for an employee between two dates (inclusive)
   */
  async getHistory(employeeId: string, from: Date, to: Date) {
    // ensure from <= to
    const start = startOfDay(from);
    const end = endOfDay(to);

    const rows = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end }
      },
      include: { shift: true },
      orderBy: { date: 'desc' }
    });

    return rows;
  }
};

// Provide the lowercase export most callers expect:
//  - named export AttendanceService (already exported)
//  - additional named export attendanceService
export const attendanceService = AttendanceService;

// default export too
export default attendanceService;
