"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Calendar,
  Check,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  X
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const steps = [
  { id: 1, name: 'Payroll Details', icon: Calendar },
  { id: 2, name: 'Select Employees', icon: Users },
  { id: 3, name: 'Calculate', icon: Calculator },
  { id: 4, name: 'Review & Finalize', icon: FileText },
]

// Demo employees for selection
const allEmployees = [
  {
    id: '1',
    employeeNumber: 'EMP001',
    name: 'Ahmed Mohammed',
    designation: 'Senior Accountant',
    department: 'Finance',
    basicSalary: 15000,
    allowances: 3000,
    selected: true,
  },
  {
    id: '2',
    employeeNumber: 'EMP002',
    name: 'Sarah Johnson',
    designation: 'HR Manager',
    department: 'Human Resources',
    basicSalary: 18000,
    allowances: 4000,
    selected: true,
  },
  {
    id: '3',
    employeeNumber: 'EMP003',
    name: 'Fatima Ali',
    designation: 'Marketing Specialist',
    department: 'Marketing',
    basicSalary: 12000,
    allowances: 2500,
    selected: true,
  },
  {
    id: '4',
    employeeNumber: 'EMP004',
    name: 'Raj Kumar',
    designation: 'Software Developer',
    department: 'IT',
    basicSalary: 14000,
    allowances: 3500,
    selected: true,
  },
  {
    id: '5',
    employeeNumber: 'EMP005',
    name: 'Maria Garcia',
    designation: 'Sales Executive',
    department: 'Sales',
    basicSalary: 10000,
    allowances: 2000,
    selected: true,
  },
]

export default function NewPayrollPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)
  const [employees, setEmployees] = useState(allEmployees)
  const [payrollData, setPayrollData] = useState({
    entity: 'gmp-trading',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    periodStart: '',
    periodEnd: '',
    paymentDate: '',
    workingDays: 26,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPayrollData(prev => ({ ...prev, [name]: value }))
  }

  const toggleEmployee = (id: string) => {
    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, selected: !emp.selected } : emp))
    )
  }

  const toggleAll = () => {
    const allSelected = employees.every(emp => emp.selected)
    setEmployees(prev => prev.map(emp => ({ ...emp, selected: !allSelected })))
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      setIsCalculated(true)
      toast({
        title: "Calculation Complete",
        description: "Payroll has been calculated successfully for all selected employees.",
      })
      setCurrentStep(4)
    }, 2000)
  }

  const handleFinalize = () => {
    toast({
      title: "Payroll Created Successfully!",
      description: `Payroll for ${getMonthName(payrollData.month)} ${payrollData.year} has been created.`,
    })
    setTimeout(() => {
      router.push('/dashboard/payroll')
    }, 1500)
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  const selectedEmployees = employees.filter(emp => emp.selected)
  const totalGross = selectedEmployees.reduce((sum, emp) => sum + emp.basicSalary + emp.allowances, 0)
  const totalDeductions = selectedEmployees.reduce((sum, emp) => sum + emp.basicSalary * 0.05, 0) // 5% deductions
  const totalNet = totalGross - totalDeductions

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/payroll')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Payroll Run</h1>
            <p className="mt-2 text-gray-600">
              Process monthly payroll for your employees
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps.find(s => s.id === currentStep)?.name}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Set the payroll period and payment details'}
            {currentStep === 2 && 'Select employees to include in this payroll run'}
            {currentStep === 3 && 'Calculate salaries and deductions'}
            {currentStep === 4 && 'Review calculations and finalize payroll'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Payroll Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="entity">Business Entity *</Label>
                <select
                  id="entity"
                  name="entity"
                  value={payrollData.entity}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="gmp-trading">GMP Trading LLC</option>
                  <option value="gmp-services">GMP Services FZE</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="month">Payroll Month *</Label>
                  <select
                    id="month"
                    name="month"
                    value={payrollData.month}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="year">Payroll Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={payrollData.year}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="periodStart">Period Start Date *</Label>
                  <Input
                    id="periodStart"
                    name="periodStart"
                    type="date"
                    value={payrollData.periodStart}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="periodEnd">Period End Date *</Label>
                  <Input
                    id="periodEnd"
                    name="periodEnd"
                    type="date"
                    value={payrollData.periodEnd}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={payrollData.paymentDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="workingDays">Working Days in Month</Label>
                  <Input
                    id="workingDays"
                    name="workingDays"
                    type="number"
                    value={payrollData.workingDays}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Payroll Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>Period: <span className="font-medium">{getMonthName(payrollData.month)} {payrollData.year}</span></p>
                  <p>Entity: <span className="font-medium">GMP Trading LLC</span></p>
                  <p>Working Days: <span className="font-medium">{payrollData.workingDays} days</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Employees */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={toggleAll}>
                  {employees.every(emp => emp.selected) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {selectedEmployees.length} of {employees.length} employees selected
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Total: AED {totalGross.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                          type="checkbox"
                          checked={employees.every(emp => emp.selected)}
                          onChange={toggleAll}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allowances</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className={`${employee.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={employee.selected}
                            onChange={() => toggleEmployee(employee.id)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.employeeNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          AED {employee.basicSalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          AED {employee.allowances.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          AED {(employee.basicSalary + employee.allowances).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Calculate */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {!isCalculated ? (
                <>
                  <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <Calculator className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Ready to Calculate</h3>
                    <p className="text-blue-700 mb-6">
                      Click the button below to calculate salaries for {selectedEmployees.length} employees
                    </p>
                    <div className="space-y-3 mb-6 max-w-md mx-auto">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Selected Employees</span>
                        <span className="font-semibold text-gray-900">{selectedEmployees.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Estimated Gross Total</span>
                        <span className="font-semibold text-gray-900">AED {totalGross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Working Days</span>
                        <span className="font-semibold text-gray-900">{payrollData.workingDays} days</span>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleCalculate}
                      disabled={isCalculating}
                      className="min-w-48"
                    >
                      {isCalculating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-5 w-5 mr-2" />
                          Calculate Payroll
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">What happens during calculation?</h4>
                        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                          <li>Proration for mid-month joiners/leavers</li>
                          <li>Automatic GPSSA calculations for UAE nationals</li>
                          <li>Deduction processing (loans, advances, etc.)</li>
                          <li>Net salary computation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Calculation Complete!</h3>
                  <p className="text-green-700 mb-6">
                    Payroll has been calculated successfully for all {selectedEmployees.length} employees
                  </p>
                  <Button onClick={handleNext}>
                    Continue to Review
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Finalize */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">Total Gross</div>
                    <div className="text-3xl font-bold text-gray-900">AED {totalGross.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">Total Deductions</div>
                    <div className="text-3xl font-bold text-red-600">AED {totalDeductions.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">Total Net</div>
                    <div className="text-3xl font-bold text-green-600">AED {totalNet.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Payroll Summary</CardTitle>
                  <CardDescription>
                    Review the calculated payroll before finalizing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Period</span>
                      <span className="text-sm font-medium text-gray-900">{getMonthName(payrollData.month)} {payrollData.year}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Entity</span>
                      <span className="text-sm font-medium text-gray-900">GMP Trading LLC</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Employees</span>
                      <span className="text-sm font-medium text-gray-900">{selectedEmployees.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Payment Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {payrollData.paymentDate || 'Not set'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Ready to Finalize</h4>
                    <p className="text-sm text-blue-800">
                      Once finalized, you can generate WPS files, payslips, and GPSSA reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || (currentStep === 3 && isCalculating)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/payroll')}
              >
                Cancel
              </Button>

              {currentStep < 3 && (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {currentStep === 4 && (
                <Button onClick={handleFinalize} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Finalize Payroll
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
