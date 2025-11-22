'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Globe,
  Users,
  Calendar,
  TrendingUp,
  Download,
  ChevronRight,
  Building2,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';

type CountryCode = 'INDIA' | 'UAE';

interface PayrollSummary {
  country: CountryCode;
  period: string;
  employeeCount: number;
  grossAmount: number;
  netAmount: number;
  currency: string;
}

export default function PayrollProcessPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [payrollRuns, setPayrollRuns] = useState<PayrollSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recent payroll runs from localStorage
    const indiaRuns = JSON.parse(localStorage.getItem('india_payroll_runs') || '[]');
    const uaeRuns = JSON.parse(localStorage.getItem('uae_payroll_runs') || '[]');

    const summary: PayrollSummary[] = [
      ...indiaRuns.slice(0, 3).map((run: any) => ({
        country: 'INDIA' as CountryCode,
        period: run.period,
        employeeCount: run.employeeCount,
        grossAmount: run.grossAmount,
        netAmount: run.netAmount,
        currency: 'INR'
      })),
      ...uaeRuns.slice(0, 3).map((run: any) => ({
        country: 'UAE' as CountryCode,
        period: run.period,
        employeeCount: run.employeeCount,
        grossAmount: run.grossAmount,
        netAmount: run.netAmount,
        currency: 'AED'
      }))
    ];

    setPayrollRuns(summary);
    setLoading(false);
  }, []);

  const countries = [
    {
      code: 'INDIA' as CountryCode,
      name: 'India',
      flag: '🇮🇳',
      currency: 'INR',
      features: ['PF', 'ESIC', 'PT', 'TDS', 'Gratuity'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      code: 'UAE' as CountryCode,
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      currency: 'AED',
      features: ['WPS', 'GPSSA', 'Gratuity', 'End of Service'],
      color: 'from-green-500 to-green-600'
    }
  ];

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    // Redirect to country-specific payroll page
    if (country === 'INDIA') {
      router.push('/dashboard/payroll/india/new');
    } else if (country === 'UAE') {
      router.push('/dashboard/payroll/uae/new');
    }
  };

  const exportToExcel = (country: CountryCode) => {
    const runsKey = country === 'INDIA' ? 'india_payroll_runs' : 'uae_payroll_runs';
    const runs = JSON.parse(localStorage.getItem(runsKey) || '[]');

    if (runs.length === 0) {
      alert('No payroll data to export');
      return;
    }

    // Prepare data for Excel
    const excelData = runs.map((run: any) => ({
      'Period': run.period,
      'Financial Year': run.financialYear || '',
      'Employee Count': run.employeeCount,
      'Gross Amount': run.grossAmount,
      'Net Amount': run.netAmount,
      'PF Amount': run.pfAmount || 0,
      'ESIC Amount': run.esicAmount || 0,
      'TDS Amount': run.tdsAmount || 0,
      'Status': run.status,
      'Created At': new Date(run.createdAt).toLocaleString()
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 },  // Period
      { wch: 15 },  // Financial Year
      { wch: 15 },  // Employee Count
      { wch: 15 },  // Gross Amount
      { wch: 15 },  // Net Amount
      { wch: 15 },  // PF Amount
      { wch: 15 },  // ESIC Amount
      { wch: 15 },  // TDS Amount
      { wch: 12 },  // Status
      { wch: 20 }   // Created At
    ];

    XLSX.utils.book_append_sheet(wb, ws, `${country} Payroll`);

    // Generate file name
    const fileName = `${country}_Payroll_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Process Payroll</h1>
        <p className="text-gray-600">Select a country to process payroll with automated compliance</p>
      </div>

      {/* Country Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {countries.map((country) => (
          <Card
            key={country.code}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
            onClick={() => handleCountrySelect(country.code)}
          >
            <div className={`h-2 bg-gradient-to-r ${country.color}`}></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{country.flag}</span>
                  <div>
                    <CardTitle className="text-2xl">{country.name}</CardTitle>
                    <CardDescription className="text-base">Currency: {country.currency}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Compliance Features:</p>
                <div className="flex flex-wrap gap-2">
                  {country.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  className={`flex-1 bg-gradient-to-r ${country.color} hover:opacity-90`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountrySelect(country.code);
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToExcel(country.code);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/payroll/salary-management')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Salary Management</CardTitle>
                <CardDescription className="text-sm">Manage pay elements</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/employees')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Manage Employees</CardTitle>
                <CardDescription className="text-sm">Add or edit employees</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/dashboard/reports')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Reports</CardTitle>
                <CardDescription className="text-sm">View payroll reports</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      {!loading && payrollRuns.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payroll Runs</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Employees</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payrollRuns.map((run, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {run.country === 'INDIA' ? '🇮🇳' : '🇦🇪'}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{run.country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{run.period}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{run.employeeCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(run.grossAmount, run.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                          {formatCurrency(run.netAmount, run.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
