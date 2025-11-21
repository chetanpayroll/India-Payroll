"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react'

// Demo employee data
const demoEmployees = [
  {
    id: '1',
    employeeNumber: 'EMP001',
    name: 'Ahmed Mohammed',
    designation: 'Senior Accountant',
    department: 'Finance',
    nationality: 'UAE',
    email: 'ahmed.m@company.com',
    phone: '+971 50 123 4567',
    basicSalary: 15000,
    joinDate: '2022-01-15',
    status: 'Active'
  },
  {
    id: '2',
    employeeNumber: 'EMP002',
    name: 'Sarah Johnson',
    designation: 'HR Manager',
    department: 'Human Resources',
    nationality: 'USA',
    email: 'sarah.j@company.com',
    phone: '+971 50 234 5678',
    basicSalary: 18000,
    joinDate: '2021-06-20',
    status: 'Active'
  },
  {
    id: '3',
    employeeNumber: 'EMP003',
    name: 'Fatima Ali',
    designation: 'Marketing Specialist',
    department: 'Marketing',
    nationality: 'UAE',
    email: 'fatima.a@company.com',
    phone: '+971 50 345 6789',
    basicSalary: 12000,
    joinDate: '2023-03-10',
    status: 'Active'
  },
  {
    id: '4',
    employeeNumber: 'EMP004',
    name: 'Raj Kumar',
    designation: 'Software Developer',
    department: 'IT',
    nationality: 'India',
    email: 'raj.k@company.com',
    phone: '+971 50 456 7890',
    basicSalary: 14000,
    joinDate: '2022-09-01',
    status: 'Active'
  },
  {
    id: '5',
    employeeNumber: 'EMP005',
    name: 'Maria Garcia',
    designation: 'Sales Executive',
    department: 'Sales',
    nationality: 'Philippines',
    email: 'maria.g@company.com',
    phone: '+971 50 567 8901',
    basicSalary: 10000,
    joinDate: '2023-07-15',
    status: 'Active'
  },
]

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [employees] = useState(demoEmployees)

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization&apos;s employees and their information
          </p>
        </div>
        <Link href="/dashboard/employees/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Employees</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{employees.length}</div>
            <div className="mt-2 text-sm text-green-600">All active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">UAE Nationals</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {employees.filter(e => e.nationality === 'UAE').length}
            </div>
            <div className="mt-2 text-sm text-gray-500">GPSSA applicable</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Departments</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {new Set(employees.map(e => e.department)).size}
            </div>
            <div className="mt-2 text-sm text-gray-500">Active departments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Avg. Salary</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              AED {Math.round(employees.reduce((sum, e) => sum + e.basicSalary, 0) / employees.length).toLocaleString()}
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
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
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
                placeholder="Search by name, employee number, or designation..."
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
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Basic Salary</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4">
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.employeeNumber}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          <span className="inline-flex items-center gap-1">
                            🇦🇪 {employee.nationality}
                          </span>
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
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-gray-900">
                        AED {employee.basicSalary.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No employees found</div>
              <p className="text-sm text-gray-500">Try adjusting your search query</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
