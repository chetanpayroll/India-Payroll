import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export const PayrollMetrics = {
    /**
     * Get monthly metrics for payroll calculation
     */
    async getMonthlyMetrics(employeeId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);

        // 1. Attendance Metrics
        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate }
            }
        });

        const presentDays = attendance.filter(a => ['PRESENT', 'LATE', 'EARLY_OUT'].includes(a.status)).length;
        const halfDays = attendance.filter(a => a.status === 'HALF_DAY').length;
        const absentDays = attendance.filter(a => a.status === 'ABSENT').length;
        const lateDays = attendance.filter(a => a.lateBy && a.lateBy > 0).length;

        // 2. Overtime
        const overtimeRequests = await prisma.overtimeRequest.findMany({
            where: {
                employeeId,
                overtimeDate: { gte: startDate, lte: endDate },
                status: 'APPROVED'
            }
        });

        const approvedOvertimeHours = overtimeRequests.reduce((sum, req) => sum + Number(req.hours), 0);

        // 3. Leaves
        const leaves = await prisma.leave.findMany({
            where: {
                employeeId,
                status: 'APPROVED',
                startDate: { lte: endDate },
                endDate: { gte: startDate }
            }
        });

        // Simple overlap calculation (days in this month)
        let leaveDays = 0;
        let unpaidLeaveDays = 0;

        leaves.forEach(leave => {
            const start = leave.startDate < startDate ? startDate : leave.startDate;
            const end = leave.endDate > endDate ? endDate : leave.endDate;
            const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

            leaveDays += days;
            if (leave.leaveType === 'UNPAID') {
                unpaidLeaveDays += days;
            }
        });

        // 4. LOP (Loss of Pay)
        // LOP = Absent Days + Unpaid Leave Days
        const lopDays = absentDays + unpaidLeaveDays;

        return {
            presentDays,
            halfDays,
            absentDays,
            lateDays,
            leaveDays,
            unpaidLeaveDays,
            lopDays,
            approvedOvertimeHours
        };
    }
};
