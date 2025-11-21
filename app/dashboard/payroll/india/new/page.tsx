'use client';

// ============================================================================
// NEW INDIA PAYROLL RUN PAGE
// ============================================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndiaPayrollEngine } from '@/lib/payroll/engines/india/IndiaPayrollEngine';
import { IndiaEmployee, PayrollPeriod, PayrollData } from '@/lib/payroll/core/types';

// Sample employees for demo
const SAMPLE_INDIA_EMPLOYEES: IndiaEmployee[] = [
  {
    id: 'IND001',
    employeeCode: 'IND001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@company.com',
    dateOfJoining: new Date('2022-04-01'),
    department: 'Engineering',
    designation: 'Senior Developer',
    status: 'active',
    country: 'INDIA',
    pan: 'ABCDE1234F',
    aadhaar: '234567890123',
    uan: '100123456789',
    bankAccount: '12345678901234',
    ifscCode: 'HDFC0001234',
    salaryStructure: {
      basic: 50000,
      hra: 20000,
      lta: 4167,
      specialAllowance: 15833,
      ctc: 1200000,
    },
    pfApplicable: true,
    esicApplicable: false,
    ptApplicable: true,
    taxRegime: 'NEW',
    state: 'KARNATAKA',
    city: 'Bengaluru',
    cityType: 'metro',
  },
  {
    id: 'IND002',
    employeeCode: 'IND002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@company.com',
    dateOfJoining: new Date('2023-01-15'),
    department: 'Finance',
    designation: 'Accountant',
    status: 'active',
    country: 'INDIA',
    pan: 'FGHIJ5678K',
    aadhaar: '345678901234',
    bankAccount: '98765432109876',
    ifscCode: 'ICIC0002345',
    salaryStructure: {
      basic: 25000,
      hra: 10000,
      specialAllowance: 5000,
      ctc: 600000,
    },
    pfApplicable: true,
    esicApplicable: false,
    ptApplicable: true,
    taxRegime: 'NEW',
    state: 'MAHARASHTRA',
    city: 'Mumbai',
    cityType: 'metro',
  },
  {
    id: 'IND003',
    employeeCode: 'IND003',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@company.com',
    dateOfJoining: new Date('2023-06-01'),
    department: 'Operations',
    designation: 'Executive',
    status: 'active',
    country: 'INDIA',
    pan: 'KLMNO9012P',
    aadhaar: '456789012345',
    esicNumber: '12345678901234567',
    bankAccount: '11223344556677',
    ifscCode: 'SBIN0003456',
    salaryStructure: {
      basic: 12000,
      hra: 4800,
      specialAllowance: 3200,
      ctc: 300000,
    },
    pfApplicable: true,
    esicApplicable: true, // Salary < 21000
    ptApplicable: true,
    taxRegime: 'NEW',
    state: 'GUJARAT',
    city: 'Ahmedabad',
    cityType: 'non-metro',
  },
];

export default function NewIndiaPayrollPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [employees, setEmployees] = useState<IndiaEmployee[]>(SAMPLE_INDIA_EMPLOYEES);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [payrollResults, setPayrollResults] = useState<PayrollData[]>([]);

  // Period selection
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Get financial year
  const getFinancialYear = (month: number, year: number) => {
    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    }
    return `${year - 1}-${year.toString().slice(-2)}`;
  };

  const financialYear = getFinancialYear(selectedMonth, selectedYear);

  // Toggle employee selection
  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Select all employees
  const selectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((e) => e.id));
    }
  };

  // Process payroll
  const processPayroll = async () => {
    setIsProcessing(true);

    try {
      const engine = new IndiaPayrollEngine();
      const selectedEmps = employees.filter((e) => selectedEmployees.includes(e.id));

      const period: PayrollPeriod = {
        month: selectedMonth,
        year: selectedYear,
        financialYear,
        startDate: new Date(selectedYear, selectedMonth - 1, 1),
        endDate: new Date(selectedYear, selectedMonth, 0),
        workingDays: engine.getWorkingDays(selectedMonth, selectedYear),
      };

      const results = await engine.processBulkPayroll(selectedEmps, period);
      setPayrollResults(results);
      setStep(3);
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Error processing payroll. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save payroll run
  const savePayrollRun = () => {
    const totalGross = payrollResults.reduce((sum, r) => sum + r.grossSalary, 0);
    const totalNet = payrollResults.reduce((sum, r) => sum + r.netSalary, 0);
    const totalPF = payrollResults.reduce((sum, r) => {
      const pf = r.deductions.find((d) => d.code === 'PF')?.amount || 0;
      return sum + pf;
    }, 0);
    const totalTDS = payrollResults.reduce((sum, r) => {
      const tds = r.deductions.find((d) => d.code === 'TDS')?.amount || 0;
      return sum + tds;
    }, 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const newRun = {
      id: `PR-${Date.now()}`,
      period: `${months[selectedMonth - 1]} ${selectedYear}`,
      financialYear,
      employeeCount: payrollResults.length,
      grossAmount: totalGross,
      netAmount: totalNet,
      pfAmount: totalPF,
      tdsAmount: totalTDS,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('india_payroll_runs') || '[]');
    localStorage.setItem('india_payroll_runs', JSON.stringify([newRun, ...existing]));

    router.push('/dashboard/payroll/india');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New India Payroll Run</h1>
        <p className="text-gray-600 mt-1">Process payroll with PF, ESIC, PT, and TDS calculations</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex mt-2">
          <span className="w-10 text-xs text-center text-gray-600">Period</span>
          <div className="w-24" />
          <span className="w-10 text-xs text-center text-gray-600">Employees</span>
          <div className="w-24" />
          <span className="w-10 text-xs text-center text-gray-600">Review</span>
        </div>
      </div>

      {/* Step 1: Select Period */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Pay Period</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {[2023, 2024, 2025].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              <span className="font-medium">Financial Year:</span> {financialYear}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Employees */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Employees</h2>
            <button
              onClick={selectAll}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedEmployees.includes(employee.id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => toggleEmployee(employee.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => {}}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {employee.employeeCode} | {employee.designation} | {employee.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(
                        employee.salaryStructure.basic +
                        (employee.salaryStructure.hra || 0) +
                        (employee.salaryStructure.specialAllowance || 0)
                      )}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {employee.pfApplicable && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">PF</span>
                      )}
                      {employee.esicApplicable && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">ESIC</span>
                      )}
                      {employee.ptApplicable && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">PT</span>
                      )}
                      <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                        {employee.taxRegime} Regime
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={processPayroll}
              disabled={selectedEmployees.length === 0 || isProcessing}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedEmployees.length === 0 || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Process ${selectedEmployees.length} Employee${selectedEmployees.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review Results */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Payroll Summary - {months[selectedMonth - 1]} {selectedYear}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-orange-100 text-sm">Total Employees</p>
                <p className="text-2xl font-bold">{payrollResults.length}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Total Gross</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payrollResults.reduce((sum, r) => sum + r.grossSalary, 0))}
                </p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Total Deductions</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payrollResults.reduce((sum, r) => sum + r.totalDeductions, 0))}
                </p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Total Net Pay</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payrollResults.reduce((sum, r) => sum + r.netSalary, 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Employee Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PF</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ESIC</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PT</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">TDS</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrollResults.map((result) => {
                    const pf = result.deductions.find((d) => d.code === 'PF')?.amount || 0;
                    const esic = result.deductions.find((d) => d.code === 'ESIC')?.amount || 0;
                    const pt = result.deductions.find((d) => d.code === 'PT')?.amount || 0;
                    const tds = result.deductions.find((d) => d.code === 'TDS')?.amount || 0;

                    return (
                      <tr key={result.employeeId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{result.employeeName}</p>
                          <p className="text-xs text-gray-500">{result.employeeCode}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(result.grossSalary)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(pf)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(esic)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(pt)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(tds)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-green-600">{formatCurrency(result.netSalary)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard/payroll/india')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePayrollRun}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Save Payroll Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
