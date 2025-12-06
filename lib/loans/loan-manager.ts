/**
 * LOANS & ADVANCES MANAGEMENT
 * 
 * Features:
 * - EMI calculation
 * - Loan Application
 */

import { prisma } from '@/lib/prisma';

export interface LoanApplication {
    employeeId: string;
    loanType: 'Personal' | 'Housing' | 'Vehicle' | 'Emergency';
    amount: number;
    interestRate: number;
    tenureMonths: number;
    reason: string;
    guarantorEmployeeId?: string;
}

export class LoanManager {

    /**
     * Calculate EMI
     * Formula: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
     */
    static calculateEMI(
        principal: number,
        annualRate: number,
        tenureMonths: number
    ): number {
        if (annualRate === 0) {
            return principal / tenureMonths;
        }

        const monthlyRate = annualRate / 12 / 100;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        return Math.round(emi);
    }

    /**
     * Apply for loan
     */
    static async applyLoan(
        application: LoanApplication
    ): Promise<{
        success: boolean;
        message: string;
        loanId?: string;
        emiAmount?: number;
    }> {
        // Calculate EMI
        const emiAmount = this.calculateEMI(
            application.amount,
            application.interestRate,
            application.tenureMonths
        );

        // Create loan application
        /*
        const loan = await prisma.loan.create({
          data: {
            employeeId: application.employeeId,
            loanType: application.loanType,
            loanAmount: application.amount,
            interestRate: application.interestRate,
            tenureMonths: application.tenureMonths,
            monthlyEmi: emiAmount,
            status: 'Pending'
          }
        });
        */

        return {
            success: true,
            message: 'Loan application submitted successfully',
            loanId: 'mock-loan-id',
            emiAmount
        };
    }
}
