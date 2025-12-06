
import { PayrollProcessor } from './processor';

// Mock Data
const mockEmployee = {
    id: 'emp-123',
    employeeCode: 'E001',
    name: 'Rahul Sharma',
    dateOfJoining: new Date('2023-01-01'),
    department: 'Engineering',
    designation: 'SDE',
    pan: 'ABCDE1234F',
    uan: '100000000000',
    salaryStructure: {
        basicSalary: 50000,
        hra: 25000,
        specialAllowance: 15000,
        transportAllowance: 1600,
        medicalAllowance: 1250,
        otherAllowances: 0,
        pfApplicable: true,
        esicApplicable: false,
        ptApplicable: true
    },
    location: 'MH',
    gender: 'Male'
};

const mockAttendance = {
    employeeId: 'emp-123',
    daysWorked: 30,
    lopDays: 0,
    overtimeHours: 0
};

describe('PayrollProcessor', () => {
    it('should calculate payroll correctly for a standard employee', () => {
        const result = PayrollProcessor.processBatch([mockEmployee], [mockAttendance], 4, 2024);

        expect(result.summary.totalGross).toBeGreaterThan(0);
        expect(result.details).toHaveLength(1);

        const detail = result.details[0];

        // Basic: 50000
        expect(detail.earnings.basic).toBe(50000);

        // HRA: 25000
        expect(detail.earnings.hra).toBe(25000);

        // PF (12% of 15000 cap = 1800)
        expect(detail.deductions.pfEmployee).toBe(1800);

        // PT (MH > 10000 = 200)
        expect(detail.deductions.pt).toBe(200);

        // Net = Gross - Deductions
        expect(detail.netPay).toBe(detail.earnings.grossEarnings - detail.deductions.totalDeductions);
    });

    it('should handle LOP (Loss of Pay) correctly', () => {
        const attendanceWithLOP = { ...mockAttendance, lopDays: 15 }; // Worked 15 days (assuming 30 day month)

        const result = PayrollProcessor.processBatch([mockEmployee], [attendanceWithLOP], 4, 2024); // April has 30 days
        const detail = result.details[0];

        // Prorated Basic: 50000 * (15/30) = 25000
        expect(detail.earnings.basic).toBe(25000);

        // PF should be on earned basic
        // 25000 > 15000 cap, so still 1800
        expect(detail.deductions.pfEmployee).toBe(1800);
    });

    it('should handle PF cap correctly for low salary', () => {
        const lowSalaryEmp = {
            ...mockEmployee,
            salaryStructure: {
                ...mockEmployee.salaryStructure,
                basicSalary: 10000
            }
        };

        const result = PayrollProcessor.processBatch([lowSalaryEmp], [mockAttendance], 4, 2024);
        const detail = result.details[0];

        // PF: 12% of 10000 = 1200
        expect(detail.deductions.pfEmployee).toBe(1200);
    });
});
