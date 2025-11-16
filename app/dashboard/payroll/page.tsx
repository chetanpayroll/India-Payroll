"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Demo payroll data
const payrollRuns = [
  {
    id: '1',
    month: 'November',
    year: 2024,
    status: 'draft',
    employeeCount: 48,
    totalGross: 245680,
    totalNet: 231420,
    createdAt: '2024-11-01',
  },
  {
    id: '2',
    month: 'October',
    year: 2024,
    status: 'finalized',
    employeeCount: 47,
    totalGross: 238450,
    totalNet: 224930,
    finalizedAt: '2024-10-28',
  },
  {
    id: '3',
    month: 'September',
    year: 2024,
    status: 'finalized',
    employeeCount: 45,
    totalGross: 235890,
    totalNet: 222340,
    finalizedAt: '2024-09-28',
  },
  {
    id: '4',
    month: 'August',
    year: 2024,
    status: 'finalized',
    employeeCount: 44,
    totalGross: 232100,
    totalNet: 218780,
    finalizedAt: '2024-08-29',
  },
]

const getStatusBadge = (status: string) => {
  const badges = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
    calculated: { label: 'Calculated', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
    approved: { label: 'Approved', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
    finalized: { label: 'Finalized', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  }
  return badges[status as keyof typeof badges] || badges.draft
}

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-2 text-gray-600">
            Process monthly payroll and generate compliance reports
          </p>
        </div>
        <Link href="/dashboard/payroll/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Payroll Run
          </Button>
        </Link>
      </div>

      {/* Current Month Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="p-2 h-fit bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">November 2024 Payroll Pending</h3>
              <p className="text-sm text-blue-800 mb-3">
                The payroll for November 2024 is in draft status. Review and process before the 25th.
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Calculate Payroll
                </Button>
                <Button size="sm" variant="outline" className="border-blue-300">
                  Review Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Current Month</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">November</div>
            <div className="mt-2 text-sm text-orange-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Amount</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              AED {payrollRuns[0].totalGross.toLocaleString()}
            </div>
            <div className="mt-2 text-sm text-gray-500">Gross salary</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Employees</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {payrollRuns[0].employeeCount}
            </div>
            <div className="mt-2 text-sm text-gray-500">This month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600">Last Processed</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">October 2024</div>
            <div className="mt-2 text-sm text-green-600">Finalized</div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Runs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>History of all payroll processing runs</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollRuns.map((run) => {
              const statusBadge = getStatusBadge(run.status)
              const StatusIcon = statusBadge.icon

              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6 flex-1">
                    {/* Month/Year */}
                    <div className="w-32">
                      <div className="text-lg font-bold text-gray-900">
                        {run.month} {run.year}
                      </div>
                      <div className="text-sm text-gray-500">
                        {run.employeeCount} employees
                      </div>
                    </div>

                    {/* Status */}
                    <div className="w-32">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Amounts */}
                    <div className="flex gap-8 flex-1">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Gross Amount</div>
                        <div className="text-lg font-semibold text-gray-900">
                          AED {run.totalGross.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Net Amount</div>
                        <div className="text-lg font-semibold text-gray-900">
                          AED {run.totalNet.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="w-40 text-sm text-gray-500">
                      {run.status === 'finalized' && run.finalizedAt ? (
                        <>
                          Finalized on<br />
                          {new Date(run.finalizedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </>
                      ) : (
                        <>
                          Created on<br />
                          {new Date(run.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {run.status === 'finalized' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          WPS
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Reports
                        </Button>
                      </>
                    )}
                    {run.status === 'draft' && (
                      <Button size="sm">
                        Continue Processing
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common payroll tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Process Current Month</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Generate WPS File</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-5 w-5" />
              <span className="text-sm">Download Payslips</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">GPSSA Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
