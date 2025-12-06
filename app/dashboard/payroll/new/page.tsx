"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowLeft,
  Save,
  Play,
  Edit2,
  TrendingUp,
  Sparkles,
  Download
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useCurrencyFormatter } from '@/lib/hooks/use-currency-formatter'
import { employeeService, payrollService } from '@/lib/services/data-service'
import { calculateEmployeePayroll } from '@/lib/services/payroll-calculator'
import { Employee, PayrollItem } from '@/lib/types'
import { formatMonth, getDaysInMonth } from '@/lib/utils'

export default function NewPayrollPage() {
  const router = useRouter()
  const { toast } = useToast()
  const formatCurrency = useCurrencyFormatter()

  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [paymentDate, setPaymentDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 28).toISOString().split('T')[0]
  )

  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([])
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [customValues, setCustomValues] = useState<Record<string, any>>({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /* Updated to use Server-Side API */
  useEffect(() => {
    // In a real app, we might fetch employee count here or just rely on backend calculation
    // For now, we fetch to show the count of eligible employees
    fetch('/api/employees?status=Active')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error("Failed to load employees", err))
  }, [])

  const calculatePayroll = async () => {
    setIsCalculating(true)

    try {
      // Call the Server-Side Calculation Engine
      const res = await fetch('/api/payroll/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          companyId: employees[0]?.companyId // Assuming single company context for now
        })
      })

      if (!res.ok) throw new Error('Calculation failed')

      const data = await res.json()

      // Map API result to UI PayrollItem structure
      const mappedItems: PayrollItem[] = data.details.map((d: any) => ({
        employeeId: d.employeeId,
        employee: {
          id: d.employeeId,
          firstName: d.employeeName.split(' ')[0],
          lastName: d.employeeName.split(' ').slice(1).join(' '),
          employeeCode: 'N/A', // Detail might need this
          department: 'General', // Detail might need this
          // ... strict type mapping might need adjustment based on API response
        },
        basicSalary: d.earnings.basic,
        housingAllowance: d.earnings.hra,
        transportationAllowance: d.earnings.transport,
        otherAllowances: d.earnings.special + d.earnings.medical + d.earnings.other,
        overtime: d.earnings.overtimePay,
        grossSalary: d.earnings.grossEarnings,
        totalDeductions: d.deductions.totalDeductions,
        netSalary: d.netPay,
        // Add breakdown if UI supports it
        pfEmployee: d.deductions.pfEmployee,
        proTax: d.deductions.pt,
        tax: d.deductions.tds,
      }))

      setPayrollItems(mappedItems)
      setIsCalculated(true)

      toast({
        title: '✅ Payroll Calculated',
        description: `Successfully processed for ${mappedItems.length} employees.`,
      })
    } catch (error) {
      console.error(error);
      toast({
        title: '❌ Calculation Error',
        description: 'Failed to calculate payroll through API.',
        variant: 'destructive',
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const savePayroll = async () => {
    if (!isCalculated || payrollItems.length === 0) return

    setIsSaving(true)

    try {
      // Call API with save=true
      const res = await fetch('/api/payroll/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          companyId: employees[0]?.companyId,
          save: true
        })
      })

      if (!res.ok) throw new Error('Save failed')

      toast({
        title: '🎉 Payroll Saved!',
        description: `Payroll for ${formatMonth(selectedMonth, selectedYear)} has been saved successfully.`,
      })

      setTimeout(() => router.push('/dashboard/payroll'), 1000)
    } catch (error: any) {
      toast({
        title: '❌ Save Error',
        description: error.message || 'Failed to save payroll.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateCustomValue = (employeeId: string, field: string, value: number) => {
    setCustomValues(prev => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        [field]: value,
      }
    }))
  }

  const recalculateSingleEmployee = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    if (!employee) return

    const custom = customValues[employeeId] || {}
    const newItem = calculateEmployeePayroll(employee, selectedYear, selectedMonth, {
      presentDays: custom.presentDays ?? 22,
      absentDays: custom.absentDays ?? 0,
      leaveDays: custom.leaveDays ?? 0,
      regularOTHours: custom.regularOTHours ?? 0,
      weekendOTHours: custom.weekendOTHours ?? 0,
      holidayOTHours: custom.holidayOTHours ?? 0,
      bonus: custom.bonus ?? 0,
      commission: custom.commission ?? 0,
      reimbursements: custom.reimbursements ?? 0,
      otherDeductions: custom.otherDeductions ?? 0,
    })

    setPayrollItems(prev => prev.map(item =>
      item.employeeId === employeeId ? newItem : item
    ))

    setEditingItem(null)

    toast({
      title: '✅ Updated',
      description: `Recalculated for ${employee.firstName} ${employee.lastName}`,
    })
  }

  const totalGross = payrollItems.reduce((sum, item) => sum + item.grossSalary, 0)
  const totalDeductions = payrollItems.reduce((sum, item) => sum + item.totalDeductions, 0)
  const totalNet = payrollItems.reduce((sum, item) => sum + item.netSalary, 0)
  const totalEmployees = payrollItems.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              New Payroll Run
            </h1>
            <p className="mt-1 text-gray-600">Process payroll for all active employees</p>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Payroll Configuration
          </CardTitle>
          <CardDescription>Select the month and payment date for this payroll run</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-semibold">Payroll Month</Label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mt-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                disabled={isCalculated}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Payroll Year</Label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mt-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                disabled={isCalculated}
              >
                {[2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={isCalculated}
                className="mt-2 border-2 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Payroll Period:</p>
                <p className="text-2xl font-bold">{formatMonth(selectedMonth, selectedYear)}</p>
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Active Employees:</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <div>
                <Button
                  onClick={calculatePayroll}
                  disabled={isCalculating || isCalculated}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
                >
                  {isCalculating ? (
                    <>Processing...</>
                  ) : isCalculated ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Calculated
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Calculate Payroll
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isCalculated && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{totalEmployees}</p>
                    <p className="mt-1 text-xs text-gray-500">Active in payroll</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gross Salary</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalGross)}</p>
                    <p className="mt-1 text-xs text-gray-500">Before deductions</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
                    <p className="mt-1 text-xs text-gray-500">Loans, advances, etc.</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <DollarSign className="h-7 w-7 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Payable</p>
                    <p className="mt-2 text-3xl font-bold text-purple-600">{formatCurrency(totalNet)}</p>
                    <p className="mt-1 text-xs text-gray-500">Final payout</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <CheckCircle2 className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Details Table */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Payroll Details</CardTitle>
                  <CardDescription className="mt-1">{payrollItems.length} employees processed • Total: {formatCurrency(totalNet)}</CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const csv = generatePayrollCSV(payrollItems)
                      downloadCSV(csv, `payroll_${selectedYear}_${selectedMonth}.csv`)
                      toast({ title: '✅ Exported', description: 'Payroll data exported to CSV' })
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={savePayroll}
                    disabled={isSaving}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg"
                  >
                    {isSaving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Payroll
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">Employee</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">Department</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Basic</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Allowances</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">OT</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Gross</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Deductions</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Net</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollItems.map((item, index) => {
                      const employee = item.employee
                      if (!employee) return null

                      const allowances = item.housingAllowance + item.transportationAllowance + item.otherAllowances
                      const isEditing = editingItem === item.employeeId

                      return (
                        <tr
                          key={index}
                          className={`border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.employeeCode}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{employee.department}</td>
                          <td className="px-4 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(item.basicSalary)}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-gray-600">
                            {formatCurrency(allowances)}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-blue-600 font-medium">
                            {formatCurrency(item.overtime)}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-green-600">
                            {formatCurrency(item.grossSalary)}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-red-600 font-medium">
                            {formatCurrency(item.totalDeductions)}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-xl text-purple-600">
                            {formatCurrency(item.netSalary)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingItem(isEditing ? null : item.employeeId)}
                              className="hover:bg-blue-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-gray-100 to-blue-100">
                    <tr className="border-t-2 border-gray-300">
                      <td className="px-4 py-4 font-bold text-gray-900" colSpan={2}>TOTAL</td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(payrollItems.reduce((s, i) => s + i.basicSalary, 0))}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(payrollItems.reduce((s, i) => s + i.housingAllowance + i.transportationAllowance + i.otherAllowances, 0))}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-blue-600">
                        {formatCurrency(payrollItems.reduce((s, i) => s + i.overtime, 0))}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-xl text-green-600">
                        {formatCurrency(totalGross)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-xl text-red-600">
                        {formatCurrency(totalDeductions)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-2xl text-purple-600">
                        {formatCurrency(totalNet)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Employees Message */}
      {!isCalculated && employees.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="h-20 w-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Employees</h3>
            <p className="text-gray-500 mb-6">Add employees first to process payroll</p>
            <Button onClick={() => router.push('/dashboard/employees')} size="lg">
              <Users className="h-5 w-5 mr-2" />
              Go to Employees
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to generate CSV
function generatePayrollCSV(items: PayrollItem[]): string {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Department',
    'Basic Salary',
    'Housing',
    'Transport',
    'Other Allowances',
    'Overtime',
    'Gross Salary',
    'Deductions',
    'Net Salary'
  ]

  const rows = items.map(item => {
    const emp = item.employee
    return [
      emp?.employeeCode || '',
      `${emp?.firstName || ''} ${emp?.lastName || ''}`,
      emp?.department || '',
      item.basicSalary.toFixed(2),
      item.housingAllowance.toFixed(2),
      item.transportationAllowance.toFixed(2),
      item.otherAllowances.toFixed(2),
      item.overtime.toFixed(2),
      item.grossSalary.toFixed(2),
      item.totalDeductions.toFixed(2),
      item.netSalary.toFixed(2)
    ]
  })

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

// Helper function to download CSV
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
