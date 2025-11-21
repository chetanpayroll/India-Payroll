// ============================================================================
// INDIA PAYROLL PROCESSING API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { IndiaPayrollEngine } from '@/lib/payroll/engines/india/IndiaPayrollEngine';
import { IndiaEmployee, PayrollPeriod } from '@/lib/payroll/core/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employees, month, year, options } = body;

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: 'No employees provided' },
        { status: 400 }
      );
    }

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    // Initialize the India payroll engine
    const engine = new IndiaPayrollEngine();

    // Build the payroll period
    const period: PayrollPeriod = {
      month: parseInt(month),
      year: parseInt(year),
      financialYear: engine.getFinancialYear(new Date(year, month - 1, 1)),
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 0),
      workingDays: engine.getWorkingDays(month, year),
    };

    // Process payroll for all employees
    const results = await engine.processBulkPayroll(employees as IndiaEmployee[], period, options);

    // Calculate summary
    const summary = {
      totalEmployees: results.length,
      totalGross: results.reduce((sum, r) => sum + r.grossSalary, 0),
      totalDeductions: results.reduce((sum, r) => sum + r.totalDeductions, 0),
      totalNet: results.reduce((sum, r) => sum + r.netSalary, 0),
      totalPF: results.reduce((sum, r) => {
        const pf = r.deductions.find(d => d.code === 'PF')?.amount || 0;
        return sum + pf;
      }, 0),
      totalESIC: results.reduce((sum, r) => {
        const esic = r.deductions.find(d => d.code === 'ESIC')?.amount || 0;
        return sum + esic;
      }, 0),
      totalPT: results.reduce((sum, r) => {
        const pt = r.deductions.find(d => d.code === 'PT')?.amount || 0;
        return sum + pt;
      }, 0),
      totalTDS: results.reduce((sum, r) => {
        const tds = r.deductions.find(d => d.code === 'TDS')?.amount || 0;
        return sum + tds;
      }, 0),
    };

    return NextResponse.json({
      success: true,
      period,
      summary,
      results,
    });

  } catch (error) {
    console.error('Payroll processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payroll' },
      { status: 500 }
    );
  }
}

// GET endpoint to calculate for a single employee (preview)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!employeeId || !month || !year) {
      return NextResponse.json(
        { error: 'employeeId, month, and year are required' },
        { status: 400 }
      );
    }

    // In a real implementation, fetch employee from database
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Use POST endpoint with employee data for processing',
      params: { employeeId, month, year },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get payroll preview' },
      { status: 500 }
    );
  }
}
