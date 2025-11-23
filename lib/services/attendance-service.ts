import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AttendanceInput {
  employeeId: string;
  date: Date;
  shiftId?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: string;
  checkOutLocation?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'WEEKEND' | 'HOLIDAY' | 'HALF_DAY' | 'LATE' | 'EARLY_OUT';
  attendanceType?: 'REGULAR' | 'LATE' | 'EARLY_OUT' | 'OVERTIME' | 'WEEKEND_WORK' | 'HOLIDAY_WORK';
  remarks?: string;
  isManualEntry?: boolean;
  enteredBy?: string;
}

export interface ShiftInput {
  entityId?: string;
  shiftCode: string;
  shiftName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDuration?: number;
  workingHours: number;
  lateGracePeriod?: number;
  earlyOutGracePeriod?: number;
  isNightShift?: boolean;
  nightShiftAllowance?: number;
  weeklyOffDays?: number[];
  overtimeApplicable?: boolean;
  overtimeMultiplier?: number;
}

export interface OvertimeRequestInput {
  employeeId: string;
  overtimeDate: Date;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
}

export class AttendanceService {
  /**
   * Mark employee check-in
   */
  async checkIn(employeeId: string, checkInLocation?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    if (existing && existing.checkInTime) {
      throw new Error('Already checked in today');
    }

    const checkInTime = new Date();

    // Get employee's shift
    const employeeShift = await prisma.employeeShift.findFirst({
      where: {
        employeeId,
        isActive: true,
        effectiveFrom: { lte: checkInTime },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: checkInTime } }
        ]
      },
      include: {
        shift: true
      }
    });

    let lateBy = 0;
    let attendanceType: 'REGULAR' | 'LATE' = 'REGULAR';
    let status: 'PRESENT' | 'LATE' = 'PRESENT';

    if (employeeShift) {
      const [shiftHour, shiftMinute] = employeeShift.shift.startTime.split(':').map(Number);
      const shiftStartTime = new Date(checkInTime);
      shiftStartTime.setHours(shiftHour, shiftMinute, 0, 0);

      const gracePeriod = employeeShift.shift.lateGracePeriod;
      const graceEndTime = new Date(shiftStartTime);
      graceEndTime.setMinutes(graceEndTime.getMinutes() + gracePeriod);

      if (checkInTime > graceEndTime) {
        lateBy = Math.floor((checkInTime.getTime() - shiftStartTime.getTime()) / 60000);
        attendanceType = 'LATE';
        status = 'LATE';
      }
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      },
      create: {
        employeeId,
        date: today,
        shiftId: employeeShift?.shiftId,
        checkInTime,
        checkInLocation,
        workingHours: 0,
        status,
        attendanceType,
        lateBy: lateBy > 0 ? lateBy : null
      },
      update: {
        checkInTime,
        checkInLocation,
        status,
        attendanceType,
        lateBy: lateBy > 0 ? lateBy : null
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true
          }
        },
        shift: true
      }
    });

    return attendance;
  }

  /**
   * Mark employee check-out
   */
  async checkOut(employeeId: string, checkOutLocation?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      },
      include: {
        shift: true
      }
    });

    if (!attendance) {
      throw new Error('No check-in record found for today');
    }

    if (attendance.checkOutTime) {
      throw new Error('Already checked out today');
    }

    if (!attendance.checkInTime) {
      throw new Error('Must check in before checking out');
    }

    const checkOutTime = new Date();

    // Calculate working hours
    const workingMinutes = Math.floor(
      (checkOutTime.getTime() - attendance.checkInTime.getTime()) / 60000
    );

    // Subtract break duration
    const breakDuration = attendance.shift?.breakDuration || 0;
    const netWorkingMinutes = Math.max(0, workingMinutes - breakDuration);
    const workingHours = parseFloat((netWorkingMinutes / 60).toFixed(2));

    // Check for early out
    let earlyOutBy = 0;
    let updatedAttendanceType = attendance.attendanceType;

    if (attendance.shift) {
      const [shiftHour, shiftMinute] = attendance.shift.endTime.split(':').map(Number);
      const shiftEndTime = new Date(checkOutTime);
      shiftEndTime.setHours(shiftHour, shiftMinute, 0, 0);

      const gracePeriod = attendance.shift.earlyOutGracePeriod;
      const graceStartTime = new Date(shiftEndTime);
      graceStartTime.setMinutes(graceStartTime.getMinutes() - gracePeriod);

      if (checkOutTime < graceStartTime) {
        earlyOutBy = Math.floor((shiftEndTime.getTime() - checkOutTime.getTime()) / 60000);
        updatedAttendanceType = 'EARLY_OUT';
      }

      // Check for overtime
      if (checkOutTime > shiftEndTime && attendance.shift.overtimeApplicable) {
        const overtimeMinutes = Math.floor(
          (checkOutTime.getTime() - shiftEndTime.getTime()) / 60000
        );
        const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));

        await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            checkOutTime,
            checkOutLocation,
            workingHours,
            earlyOutBy: earlyOutBy > 0 ? earlyOutBy : null,
            attendanceType: updatedAttendanceType,
            overtimeHours,
            overtimeApproved: false
          }
        });

        return await prisma.attendance.findUnique({
          where: { id: attendance.id },
          include: {
            employee: {
              select: {
                id: true,
                employeeNumber: true,
                firstName: true,
                lastName: true
              }
            },
            shift: true
          }
        });
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        checkOutLocation,
        workingHours,
        earlyOutBy: earlyOutBy > 0 ? earlyOutBy : null,
        attendanceType: updatedAttendanceType
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true
          }
        },
        shift: true
      }
    });

    return updatedAttendance;
  }

  /**
   * Manual attendance marking (by HR/Admin)
   */
  async markAttendance(input: AttendanceInput) {
    const date = new Date(input.date);
    date.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: input.employeeId,
          date
        }
      }
    });

    if (existing && !input.isManualEntry) {
      throw new Error('Attendance already marked for this date');
    }

    let workingHours = 0;
    if (input.checkInTime && input.checkOutTime) {
      const workingMinutes = Math.floor(
        (input.checkOutTime.getTime() - input.checkInTime.getTime()) / 60000
      );
      workingHours = parseFloat((workingMinutes / 60).toFixed(2));
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: input.employeeId,
          date
        }
      },
      create: {
        employeeId: input.employeeId,
        date,
        shiftId: input.shiftId,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        checkInLocation: input.checkInLocation,
        checkOutLocation: input.checkOutLocation,
        workingHours,
        status: input.status || 'PRESENT',
        attendanceType: input.attendanceType || 'REGULAR',
        remarks: input.remarks,
        isManualEntry: input.isManualEntry || false,
        enteredBy: input.enteredBy,
        requiresApproval: true
      },
      update: {
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        checkInLocation: input.checkInLocation,
        checkOutLocation: input.checkOutLocation,
        workingHours,
        status: input.status || 'PRESENT',
        attendanceType: input.attendanceType || 'REGULAR',
        remarks: input.remarks,
        isManualEntry: input.isManualEntry || false,
        enteredBy: input.enteredBy
      },
      include: {
        employee: true,
        shift: true
      }
    });

    return attendance;
  }

  /**
   * Get attendance records with filtering
   */
  async getAttendance(filters?: {
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    attendanceType?: string;
  }) {
    const where: any = {};

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.attendanceType) {
      where.attendanceType = filters.attendanceType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            designation: true,
            department: true
          }
        },
        shift: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return attendance;
  }

  /**
   * Get attendance statistics
   */
  async getAttendanceStatistics(date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const [present, absent, late, onLeave, halfDay, total] = await Promise.all([
      prisma.attendance.count({
        where: {
          date: targetDate,
          status: { in: ['PRESENT', 'LATE', 'EARLY_OUT'] }
        }
      }),
      prisma.attendance.count({
        where: {
          date: targetDate,
          status: 'ABSENT'
        }
      }),
      prisma.attendance.count({
        where: {
          date: targetDate,
          status: 'LATE'
        }
      }),
      prisma.attendance.count({
        where: {
          date: targetDate,
          status: 'LEAVE'
        }
      }),
      prisma.attendance.count({
        where: {
          date: targetDate,
          status: 'HALF_DAY'
        }
      }),
      prisma.employee.count({
        where: {
          status: 'ACTIVE'
        }
      })
    ]);

    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(2) : '0';

    return {
      present,
      absent,
      late,
      onLeave,
      halfDay,
      totalEmployees: total,
      attendanceRate: parseFloat(attendanceRate)
    };
  }

  /**
   * Approve overtime
   */
  async approveOvertime(attendanceId: string, approvedBy: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    if (!attendance.overtimeHours || attendance.overtimeHours <= 0) {
      throw new Error('No overtime hours to approve');
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        overtimeApproved: true,
        approvedBy,
        approvedDate: new Date()
      },
      include: {
        employee: true,
        shift: true
      }
    });

    return updated;
  }

  // ==================== SHIFT MANAGEMENT ====================

  /**
   * Create a new shift
   */
  async createShift(input: ShiftInput) {
    const shift = await prisma.shift.create({
      data: {
        entityId: input.entityId,
        shiftCode: input.shiftCode,
        shiftName: input.shiftName,
        startTime: input.startTime,
        endTime: input.endTime,
        breakDuration: input.breakDuration || 0,
        workingHours: input.workingHours,
        lateGracePeriod: input.lateGracePeriod || 15,
        earlyOutGracePeriod: input.earlyOutGracePeriod || 15,
        isNightShift: input.isNightShift || false,
        nightShiftAllowance: input.nightShiftAllowance,
        weeklyOffDays: input.weeklyOffDays || [5, 6],
        overtimeApplicable: input.overtimeApplicable !== false,
        overtimeMultiplier: input.overtimeMultiplier || 1.5
      }
    });

    return shift;
  }

  /**
   * Get all shifts
   */
  async getShifts(entityId?: string) {
    const where: any = { isActive: true };

    if (entityId) {
      where.entityId = entityId;
    }

    const shifts = await prisma.shift.findMany({
      where,
      orderBy: {
        shiftCode: 'asc'
      }
    });

    return shifts;
  }

  /**
   * Assign shift to employee
   */
  async assignShift(employeeId: string, shiftId: string, effectiveFrom: Date, effectiveTo?: Date) {
    // Deactivate current active shift
    await prisma.employeeShift.updateMany({
      where: {
        employeeId,
        isActive: true
      },
      data: {
        isActive: false,
        effectiveTo: new Date()
      }
    });

    // Assign new shift
    const employeeShift = await prisma.employeeShift.create({
      data: {
        employeeId,
        shiftId,
        effectiveFrom,
        effectiveTo,
        isActive: true
      },
      include: {
        shift: true,
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return employeeShift;
  }

  // ==================== OVERTIME REQUESTS ====================

  /**
   * Create overtime request
   */
  async createOvertimeRequest(input: OvertimeRequestInput) {
    const overtimeRequest = await prisma.overtimeRequest.create({
      data: {
        employeeId: input.employeeId,
        overtimeDate: input.overtimeDate,
        startTime: input.startTime,
        endTime: input.endTime,
        hours: input.hours,
        reason: input.reason,
        status: 'PENDING'
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            basicSalary: true
          }
        }
      }
    });

    return overtimeRequest;
  }

  /**
   * Approve overtime request
   */
  async approveOvertimeRequest(id: string, approvedBy: string, overtimeRate?: number) {
    const request = await prisma.overtimeRequest.findUnique({
      where: { id },
      include: {
        employee: true
      }
    });

    if (!request) {
      throw new Error('Overtime request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Only pending requests can be approved');
    }

    // Calculate amount
    const dailySalary = request.employee.basicSalary.toNumber() / 30;
    const hourlyRate = dailySalary / 8;
    const rate = overtimeRate || 1.5;
    const amount = hourlyRate * request.hours.toNumber() * rate;

    const updated = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedDate: new Date(),
        overtimeRate: rate,
        amount
      },
      include: {
        employee: true
      }
    });

    return updated;
  }

  /**
   * Reject overtime request
   */
  async rejectOvertimeRequest(id: string, rejectionReason: string) {
    const updated = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason
      },
      include: {
        employee: true
      }
    });

    return updated;
  }

  /**
   * Get overtime requests
   */
  async getOvertimeRequests(filters?: {
    employeeId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.overtimeDate = {};
      if (filters.startDate) {
        where.overtimeDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.overtimeDate.lte = filters.endDate;
      }
    }

    const requests = await prisma.overtimeRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });

    return requests;
  }

  /**
   * Mark attendance from leave records
   */
  async syncLeaveAttendance(date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get approved leaves for the date
    const leaves = await prisma.leave.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: targetDate },
        endDate: { gte: targetDate }
      }
    });

    // Mark attendance as LEAVE for each employee
    for (const leave of leaves) {
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: leave.employeeId,
            date: targetDate
          }
        },
        create: {
          employeeId: leave.employeeId,
          date: targetDate,
          status: 'LEAVE',
          attendanceType: 'REGULAR',
          workingHours: 0,
          isManualEntry: true,
          remarks: `On ${leave.leaveType} leave`
        },
        update: {
          status: 'LEAVE',
          remarks: `On ${leave.leaveType} leave`
        }
      });
    }

    return leaves.length;
  }
}

export const attendanceService = new AttendanceService();
