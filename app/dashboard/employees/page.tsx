"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Search,
  Download,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building,
  User,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useInitData } from '@/lib/hooks/use-init-data'
import { useCountry } from '@/lib/context/CountryContext'
import { employeeService } from '@/lib/services/data-service'
import { Employee } from '@/lib/types'
import { formatDate, generateId, validateEmiratesID, validateIBAN } from '@/lib/utils'
import { downloadAsJSON } from '@/lib/storage'
import { useCurrencyFormatter, useCurrencySymbol } from '@/lib/hooks/use-currency-formatter'

export default function EmployeesPage() {
  useInitData()
  const { country } = useCountry()
  const formatCurrency = useCurrencyFormatter()
  const currencySymbol = useCurrencySymbol()

  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const { toast } = useToast()

  // Load employees
  useEffect(() => {
    loadEmployees()
  }, [])

  // Filter employees
  useEffect(() => {
    let filtered = employees

    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment)
    }

    setFilteredEmployees(filtered)
  }, [searchQuery, selectedDepartment, employees])

  const loadEmployees = () => {
    const allEmployees = employeeService.getAll()
    setEmployees(allEmployees)
  }

  const departments = ['all', ...employeeService.getDepartments()]

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const success = employeeService.delete(id)
      if (success) {
        toast({
          title: 'Employee Deleted',
          description: 'Employee has been successfully deleted.',
        })
        loadEmployees()
      }
    }
  }

  const handleExport = () => {
    const data = employees.map(emp => ({
      'Employee Code': emp.employeeCode,
      'Name': `${emp.firstName} ${emp.lastName}`,
      'Email': emp.email,
      'Phone': emp.phoneNumber,
      'Department': emp.department,
      'Designation': emp.designation,
      'Basic Salary': emp.basicSalary,
      'HRA': emp.hra,
      'Special Allowance': emp.specialAllowance,
      'PAN': emp.pan,
      'Nationality': emp.nationality,
      'Date of Joining': emp.dateOfJoining,
    }))

    downloadAsJSON(data, `employees_${new Date().toISOString().split('T')[0]}.json`)

    toast({
      title: 'Data Exported',
      description: 'Employee data has been exported successfully.',
    })
  }

  const nationals = employees.filter(e => {
    const nat = e.nationality.toLowerCase()
    return nat === 'indian' || nat === 'india'
  }).length

  const avgSalary = employees.length > 0
    ? employees.reduce((sum, e) => sum + e.basicSalary, 0) / employees.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Employees
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your organization&apos;s employees and their information
          </p>
        </div>
        <Link href="/dashboard/employees/new">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Employees</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{employees.length}</div>
            <div className="mt-2 text-sm text-green-600">All active</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">
              Indian Nationals
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{nationals}</div>
            <div className="mt-2 text-sm text-gray-500">
              EPF/ESI applicable
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Departments</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {departments.filter(d => d !== 'all').length}
            </div>
            <div className="mt-2 text-sm text-gray-500">Active departments</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Avg. Salary</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(avgSalary).split('.')[0]}
            </div>
            <div className="mt-2 text-sm text-gray-500">Per month</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, employee code, email, or department..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Employee</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Designation</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Department</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Salary</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const totalSalary = employee.basicSalary + employee.hra + employee.specialAllowance
                  return (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.employeeCode}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {employee.nationality}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-900">{employee.designation}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(totalSalary)}
                        </div>
                        <div className="text-xs text-gray-500">Basic: {formatCurrency(employee.basicSalary)}</div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.employmentStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : employee.employmentStatus === 'probation'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {employee.employmentStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No employees found</div>
              <p className="text-sm text-gray-500">Try adjusting your search query or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setEditingEmployee(null)
          }}
          onSave={() => {
            setEditingEmployee(null)
            loadEmployees()
          }}
        />
      )}
    </div>
  )
}

// Employee Modal Component
function EmployeeModal({
  employee,
  onClose,
  onSave
}: {
  employee: Employee | null
  onClose: () => void
  onSave: () => void
}) {
  const { toast } = useToast()
  const formatCurrency = useCurrencyFormatter()
  const currencySymbol = useCurrencySymbol()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Partial<Employee>>(employee || {
    employeeCode: `EMP${String(employeeService.count() + 1).padStart(3, '0')}`,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nationality: '',
    department: '',
    designation: '',
    basicSalary: 0,
    hra: 0,
    specialAllowance: 0,
    medicalAllowance: 0,
    dateOfJoining: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    pan: '',
    aadhaar: '',
    uan: '',
    esicNumber: '',
    employmentType: 'permanent',
    employmentStatus: 'active',
    contractStartDate: new Date().toISOString().split('T')[0],
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    annualLeaveBalance: 30,
    sickLeaveBalance: 90,
    otherAllowances: [],
    isActive: true,
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName) newErrors.firstName = 'Required'
    if (!formData.lastName) newErrors.lastName = 'Required'
    if (!formData.email) newErrors.email = 'Required'
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Required'
    if (!formData.department) newErrors.department = 'Required'
    if (!formData.designation) newErrors.designation = 'Required'
    if (!formData.basicSalary || formData.basicSalary <= 0) newErrors.basicSalary = 'Must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (employee) {
        // Update existing
        employeeService.update(employee.id, formData)
        toast({
          title: 'Employee Updated',
          description: 'Employee information has been updated successfully.',
        })
      } else {
        // Create new
        employeeService.create(formData as Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>)
        toast({
          title: 'Employee Added',
          description: 'New employee has been added successfully.',
        })
      }
      onSave()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save employee. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Employee Code *</Label>
                <Input
                  value={formData.employeeCode}
                  onChange={(e) => updateField('employeeCode', e.target.value)}
                  className={errors.employeeCode ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <Label>Nationality *</Label>
                <Input
                  value={formData.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department *</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className={errors.department ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input
                  value={formData.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                  className={errors.designation ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>Date of Joining</Label>
                <Input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => updateField('dateOfJoining', e.target.value)}
                />
              </div>
              <div>
                <Label>Employment Type</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.employmentType}
                  onChange={(e) => updateField('employmentType', e.target.value)}
                >
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Internship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Basic Salary ({currencySymbol}) *</Label>
                <Input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => updateField('basicSalary', parseFloat(e.target.value) || 0)}
                  className={errors.basicSalary ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>HRA ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={formData.hra}
                  onChange={(e) => updateField('hra', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Special Allowance ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={formData.specialAllowance}
                  onChange={(e) => updateField('specialAllowance', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Total Monthly Salary:</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency((formData.basicSalary || 0) + (formData.hra || 0) + (formData.specialAllowance || 0))}
              </div>
            </div>
          </div>

          {/* India Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">India Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>PAN Number</Label>
                <Input
                  value={formData.pan}
                  onChange={(e) => updateField('pan', e.target.value)}
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <Label>Aadhaar Number</Label>
                <Input
                  value={formData.aadhaar}
                  onChange={(e) => updateField('aadhaar', e.target.value)}
                  placeholder="1234 5678 9012"
                />
              </div>
              <div>
                <Label>UAN</Label>
                <Input
                  value={formData.uan}
                  onChange={(e) => updateField('uan', e.target.value)}
                />
              </div>
              <div>
                <Label>ESIC Number</Label>
                <Input
                  value={formData.esicNumber}
                  onChange={(e) => updateField('esicNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => updateField('bankName', e.target.value)}
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={formData.bankAccountNumber}
                  onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>IFSC Code</Label>
                <Input
                  value={formData.ifscCode}
                  onChange={(e) => updateField('ifscCode', e.target.value)}
                  placeholder="HDFC0001234"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              {employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
