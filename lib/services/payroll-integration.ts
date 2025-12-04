import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export const PayrollIntegrationService = {
    /**
     * Calculate LOP deduction for an employee for a specific month
     */
    async calculateLOP(employeeId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);

        const absentDays = await prisma.attendance.count({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate },
                status: 'ABSENT'
            }
        });

        const unpaidLeaves = await prisma.leave.findMany({
            where: {
                employeeId,
                leaveType: 'UNPAID',
                status: 'APPROVED',
                startDate: { lte: endDate },
                endDate: { gte: startDate }
            }
        });

        let unpaidLeaveDays = 0;
        // Simple calculation, ideally use LeaveService.calculateWorkingDays
        unpaidLeaves.forEach(leave => {
            unpaidLeaveDays += Number(leave.numberOfDays);
        });

        return absentDays + unpaidLeaveDays;
    },

    /**
     * Calculate Overtime hours
     */
    async calculateOvertime(employeeId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);

        const otRequests = await prisma.overtimeRequest.findMany({
            where: {
                employeeId,
                overtimeDate: { gte: startDate, lte: endDate },
                status: 'APPROVED'
            }
        });

        return otRequests.reduce((sum, req) => sum + Number(req.hours), 0);
    }
};
