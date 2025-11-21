'use client';

// ============================================================================
// INDIA PAYSLIP COMPONENT
// ============================================================================

import { PayrollData, PayrollEarning, PayrollDeduction, EmployerContribution } from '@/lib/payroll/core/types';

interface PayslipProps {
  data: PayrollData;
  companyName?: string;
  companyAddress?: string;
  logoUrl?: string;
}

export function IndiaPayslip({ data, companyName = 'Company Name', companyAddress, logoUrl }: PayslipProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (month: number, year: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[month - 1]} ${year}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto print:shadow-none">
      {/* Header */}
      <div className="border-b-2 border-orange-500 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 mb-2" />}
            <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
            {companyAddress && <p className="text-sm text-gray-600">{companyAddress}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-orange-600">PAYSLIP</h2>
            <p className="text-sm text-gray-600">
              {formatMonth(data.payPeriod.month, data.payPeriod.year)}
            </p>
            <p className="text-xs text-gray-500">FY: {data.payPeriod.financialYear}</p>
          </div>
        </div>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex">
            <span className="text-sm text-gray-500 w-32">Employee Name:</span>
            <span className="text-sm font-medium text-gray-900">{data.employeeName}</span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-32">Employee Code:</span>
            <span className="text-sm font-medium text-gray-900">{data.employeeCode}</span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-32">Department:</span>
            <span className="text-sm font-medium text-gray-900">{data.department}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex">
            <span className="text-sm text-gray-500 w-32">Designation:</span>
            <span className="text-sm font-medium text-gray-900">{data.designation}</span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-32">Working Days:</span>
            <span className="text-sm font-medium text-gray-900">{data.payPeriod.workingDays}</span>
          </div>
          <div className="flex">
            <span className="text-sm text-gray-500 w-32">Present Days:</span>
            <span className="text-sm font-medium text-gray-900">{data.payPeriod.presentDays || data.payPeriod.workingDays}</span>
          </div>
        </div>
      </div>

      {/* Earnings and Deductions */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Earnings */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 bg-green-100 px-3 py-2 rounded-t-lg">
            EARNINGS
          </h3>
          <div className="border border-t-0 border-gray-200 rounded-b-lg">
            <table className="w-full">
              <tbody>
                {data.earnings.map((earning, index) => (
                  <tr key={earning.code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-sm text-gray-700">{earning.name}</td>
                    <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(earning.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-green-50 font-semibold">
                  <td className="px-3 py-2 text-sm text-gray-700">Gross Earnings</td>
                  <td className="px-3 py-2 text-sm text-right text-green-700">
                    {formatCurrency(data.grossSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 bg-red-100 px-3 py-2 rounded-t-lg">
            DEDUCTIONS
          </h3>
          <div className="border border-t-0 border-gray-200 rounded-b-lg">
            <table className="w-full">
              <tbody>
                {data.deductions.map((deduction, index) => (
                  <tr key={deduction.code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-sm text-gray-700">{deduction.name}</td>
                    <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(deduction.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-red-50 font-semibold">
                  <td className="px-3 py-2 text-sm text-gray-700">Total Deductions</td>
                  <td className="px-3 py-2 text-sm text-right text-red-700">
                    {formatCurrency(data.totalDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-orange-100">Net Pay</p>
            <p className="text-3xl font-bold">{formatCurrency(data.netSalary)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">In Words</p>
            <p className="text-sm font-medium">{numberToWords(data.netSalary)}</p>
          </div>
        </div>
      </div>

      {/* Employer Contributions */}
      {data.employerContributions && data.employerContributions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-2 rounded-t-lg">
            EMPLOYER CONTRIBUTIONS
          </h3>
          <div className="border border-t-0 border-gray-200 rounded-b-lg">
            <div className="grid grid-cols-4 gap-4 p-3">
              {data.employerContributions.map((contribution) => (
                <div key={contribution.code} className="text-center">
                  <p className="text-xs text-gray-500">{contribution.name}</p>
                  <p className="text-sm font-medium text-blue-700">{formatCurrency(contribution.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tax Details */}
      {data.taxDetails && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 bg-purple-100 px-3 py-2 rounded-t-lg">
            TAX COMPUTATION ({data.taxDetails.regime} REGIME)
          </h3>
          <div className="border border-t-0 border-gray-200 rounded-b-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Taxable Income (Projected)</p>
                <p className="font-medium">{formatCurrency(data.taxDetails.taxableIncome)}</p>
              </div>
              <div>
                <p className="text-gray-500">Tax Amount (Annual)</p>
                <p className="font-medium">{formatCurrency(data.taxDetails.totalTax)}</p>
              </div>
              <div>
                <p className="text-gray-500">Monthly TDS</p>
                <p className="font-medium text-purple-700">
                  {formatCurrency(Math.round(data.taxDetails.totalTax / 12))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <p className="text-xs text-gray-500 text-center">
          This is a computer-generated payslip and does not require signature.
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Generated on {new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

// Helper function to convert number to words
function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  const rupees = Math.floor(amount);
  return 'Rupees ' + numToWords(rupees) + ' Only';
}

export default IndiaPayslip;
