import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LeaveRequestInput {
  employeeId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'EMERGENCY' | 'COMPASSIONATE' | 'STUDY' | 'HAJJ';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason?: string;
  attachmentUrl?: string;
}

export interface LeaveApprovalInput {
  approvedBy: string;
  rejectionReason?: string;
}

export class LeaveService {
  /**
   * Create a new leave request with validation
   */
  async createLeaveRequest(input: LeaveRequestInput) {
    // Validate date range
    if (input.startDate > input.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    // Check for overlapping leave requests
    const overlapping = await prisma.leave.findFirst({
      where: {
        employeeId: input.employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: input.startDate } },
              { endDate: { gte: input.startDate } }
            ]
          },
          {
            AND: [
              { startDate: { lte: input.endDate } },
              { endDate: { gte: input.endDate } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      throw new Error('Leave request overlaps with existing leave');
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await this.getOrCreateLeaveBalance(input.employeeId, currentYear);

    if (input.leaveType === 'ANNUAL') {
      if (balance.annualLeaveBalance < input.numberOfDays) {
        throw new Error(`Insufficient annual leave balance. Available: ${balance.annualLeaveBalance} days`);
      }
    } else if (input.leaveType === 'SICK') {
      if (balance.sickLeaveBalance < input.numberOfDays) {
        throw new Error(`Insufficient sick leave balance. Available: ${balance.sickLeaveBalance} days`);
      }
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        employeeId: input.employeeId,
        leaveType: input.leaveType,
        startDate: input.startDate,
        endDate: input.endDate,
        numberOfDays: input.numberOfDays,
        reason: input.reason,
        attachmentUrl: input.attachmentUrl,
        status: 'PENDING',
        appliedDate: new Date()
      },
      include: {
        employee: true
      }
    });

    return leave;
  }

  /**
   * Get all leave requests with filtering
   */
  async getLeaveRequests(filters?: {
    employeeId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    leaveType?: string;
  }) {
    const where: any = {};

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.leaveType) {
      where.leaveType = filters.leaveType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.OR = [];
      if (filters.startDate) {
        where.OR.push({
          startDate: { gte: filters.startDate }
        });
      }
      if (filters.endDate) {
        where.OR.push({
          endDate: { lte: filters.endDate }
        });
      }
    }

    const leaves = await prisma.leave.findMany({
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });

    return leaves;
  }

  /**
   * Get leave request by ID
   */
  async getLeaveRequestById(id: string) {
    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: true,
        approver: true
      }
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    return leave;
  }

  /**
   * Approve leave request
   */
  async approveLeaveRequest(id: string, approvalInput: LeaveApprovalInput) {
    const leave = await prisma.leave.findUnique({
      where: { id }
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error('Only pending leave requests can be approved');
    }

    // Update leave balance
    const year = leave.startDate.getFullYear();
    const balance = await this.getOrCreateLeaveBalance(leave.employeeId, year);

    const updateData: any = {};

    if (leave.leaveType === 'ANNUAL') {
      updateData.annualLeaveTaken = balance.annualLeaveTaken + leave.numberOfDays.toNumber();
      updateData.annualLeaveBalance = balance.annualLeaveBalance - leave.numberOfDays.toNumber();
    } else if (leave.leaveType === 'SICK') {
      updateData.sickLeaveTaken = balance.sickLeaveTaken + leave.numberOfDays.toNumber();
      updateData.sickLeaveBalance = balance.sickLeaveBalance - leave.numberOfDays.toNumber();
    } else if (leave.leaveType === 'UNPAID') {
      updateData.unpaidLeaveTaken = balance.unpaidLeaveTaken + leave.numberOfDays.toNumber();
    } else if (leave.leaveType === 'MATERNITY') {
      updateData.maternityLeaveTaken = balance.maternityLeaveTaken + leave.numberOfDays.toNumber();
    } else if (leave.leaveType === 'PATERNITY') {
      updateData.paternityLeaveTaken = balance.paternityLeaveTaken + leave.numberOfDays.toNumber();
    } else if (leave.leaveType === 'EMERGENCY') {
      updateData.emergencyLeaveTaken = balance.emergencyLeaveTaken + leave.numberOfDays.toNumber();
    }

    // Use transaction to ensure atomicity
    const [updatedLeave] = await prisma.$transaction([
      prisma.leave.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: approvalInput.approvedBy,
          approvedDate: new Date()
        },
        include: {
          employee: true,
          approver: true
        }
      }),
      prisma.leaveBalance.update({
        where: {
          employeeId_year: {
            employeeId: leave.employeeId,
            year
          }
        },
        data: updateData
      })
    ]);

    return updatedLeave;
  }

  /**
   * Reject leave request
   */
  async rejectLeaveRequest(id: string, approvalInput: LeaveApprovalInput) {
    const leave = await prisma.leave.findUnique({
      where: { id }
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error('Only pending leave requests can be rejected');
    }

    if (!approvalInput.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: approvalInput.approvedBy,
        approvedDate: new Date(),
        rejectionReason: approvalInput.rejectionReason
      },
      include: {
        employee: true,
        approver: true
      }
    });

    return updatedLeave;
  }

  /**
   * Cancel leave request
   */
  async cancelLeaveRequest(id: string, employeeId: string) {
    const leave = await prisma.leave.findUnique({
      where: { id }
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.employeeId !== employeeId) {
      throw new Error('Unauthorized to cancel this leave request');
    }

    if (leave.status !== 'PENDING' && leave.status !== 'APPROVED') {
      throw new Error('Only pending or approved leave requests can be cancelled');
    }

    // If approved, restore leave balance
    if (leave.status === 'APPROVED') {
      const year = leave.startDate.getFullYear();
      const balance = await this.getOrCreateLeaveBalance(leave.employeeId, year);

      const updateData: any = {};

      if (leave.leaveType === 'ANNUAL') {
        updateData.annualLeaveTaken = balance.annualLeaveTaken - leave.numberOfDays.toNumber();
        updateData.annualLeaveBalance = balance.annualLeaveBalance + leave.numberOfDays.toNumber();
      } else if (leave.leaveType === 'SICK') {
        updateData.sickLeaveTaken = balance.sickLeaveTaken - leave.numberOfDays.toNumber();
        updateData.sickLeaveBalance = balance.sickLeaveBalance + leave.numberOfDays.toNumber();
      } else if (leave.leaveType === 'UNPAID') {
        updateData.unpaidLeaveTaken = balance.unpaidLeaveTaken - leave.numberOfDays.toNumber();
      }

      await prisma.$transaction([
        prisma.leave.update({
          where: { id },
          data: { status: 'CANCELLED' }
        }),
        prisma.leaveBalance.update({
          where: {
            employeeId_year: {
              employeeId: leave.employeeId,
              year
            }
          },
          data: updateData
        })
      ]);
    } else {
      await prisma.leave.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
    }

    return await this.getLeaveRequestById(id);
  }

  /**
   * Get leave balance for an employee
   */
  async getLeaveBalance(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const balance = await this.getOrCreateLeaveBalance(employeeId, targetYear);
    return balance;
  }

  /**
   * Get or create leave balance for an employee
   */
  private async getOrCreateLeaveBalance(employeeId: string, year: number) {
    let balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year
        }
      }
    });

    if (!balance) {
      // Create default leave balance
      balance = await prisma.leaveBalance.create({
        data: {
          employeeId,
          year,
          annualLeaveEntitled: 30,
          annualLeaveTaken: 0,
          annualLeaveBalance: 30,
          annualLeaveCarryForward: 0,
          sickLeaveEntitled: 15,
          sickLeaveTaken: 0,
          sickLeaveBalance: 15,
          unpaidLeaveTaken: 0,
          maternityLeaveTaken: 0,
          paternityLeaveTaken: 0,
          emergencyLeaveTaken: 0,
          leaveEncashed: 0,
          encashmentAmount: 0
        }
      });
    }

    return balance;
  }

  /**
   * Get leave statistics
   */
  async getLeaveStatistics(filters?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.appliedDate = {};
      if (filters.startDate) {
        where.appliedDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.appliedDate.lte = filters.endDate;
      }
    }

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.count({ where: { ...where, status: 'PENDING' } }),
      prisma.leave.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.leave.count({ where: { ...where, status: 'REJECTED' } })
    ]);

    return {
      total,
      pending,
      approved,
      rejected
    };
  }

  /**
   * Calculate leave days (excluding weekends and holidays)
   */
  async calculateLeaveDays(
    startDate: Date,
    endDate: Date,
    includeWeekends: boolean = false,
    includeHolidays: boolean = false
  ): Promise<number> {
    let days = 0;
    const currentDate = new Date(startDate);

    // Get public holidays in the date range
    const holidays = includeHolidays ? [] : await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday, Saturday
      const dateString = currentDate.toISOString().split('T')[0];
      const isHoliday = holidayDates.has(dateString);

      if ((!isWeekend || includeWeekends) && (!isHoliday || includeHolidays)) {
        days++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }
}

export const leaveService = new LeaveService();
