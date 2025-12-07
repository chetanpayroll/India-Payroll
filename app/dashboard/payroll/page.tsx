"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useInitData } from '@/lib/hooks/use-init-data'
import { useCurrencyFormatter } from '@/lib/hooks/use-currency-formatter'
import { payrollService } from '@/lib/services/data-service'
import { PayrollRun } from '@/lib/types'
import { formatMonth } from '@/lib/utils'

export default function PayrollPage() {
  useInitData()
  const formatCurrency = useCurrencyFormatter()

  // State for payroll runs
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])

  /* Updated to use Server-Side API */
  useEffect(() => {
    loadPayrolls()
  }, [])

  const loadPayrolls = async () => {
    try {
      const res = await fetch('/api/payroll')
      if (res.ok) {
        const data = await res.json()
        setPayrollRuns(data)
      } else {
        console.error('Failed to fetch payroll runs')
      }
    } catch (error) {
      console.error('Error loading payrolls:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'calculated':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalized':
        return <CheckCircle2 className="h-4 w-4" />
      case 'approved':
      case 'calculated':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const totalProcessed = payrollRuns.reduce((sum, run) => sum + run.totalNet, 0)
  const totalEmployees = payrollRuns.length > 0 ? payrollRuns[0].totalEmployees : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payroll Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and process monthly payroll runs
          </p>
        </div>
        <Link href="/dashboard/payroll/new">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            New Payroll Run
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Runs</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{payrollRuns.length}</p>
                <p className="mt-1 text-xs text-gray-500">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Processed</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totalProcessed)}</p>
                <p className="mt-1 text-xs text-gray-500">All payrolls</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Employees</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">{totalEmployees}</p>
                <p className="mt-1 text-xs text-gray-500">Active in system</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Monthly</p>
                <p className="mt-2 text-2xl font-bold text-orange-600">
                  {payrollRuns.length > 0 ? formatCurrency(totalProcessed / payrollRuns.length) : formatCurrency(0)}
                </p>
                <p className="mt-1 text-xs text-gray-500">Per payroll run</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Runs List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Payroll Runs</CardTitle>
              <CardDescription className="mt-1">
                {payrollRuns.length} payroll run{payrollRuns.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {payrollRuns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Employees</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Gross Amount</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollRuns.map((run, index) => (
                    <tr
                      key={run.id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{formatMonth(run.payrollMonth, run.payrollYear)}</div>
                        <div className="text-sm text-gray-500">{run.runCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(run.status)}`}>
                          {getStatusIcon(run.status)}
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-medium text-gray-900">{run.totalEmployees}</div>
                        <div className="text-xs text-gray-500">employees</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-semibold text-green-600">{formatCurrency(run.totalGross)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-bold text-xl text-purple-600">{formatCurrency(run.totalNet)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(run.paymentDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="ghost" className="hover:bg-blue-100">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="hover:bg-green-100">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="hover:bg-purple-100">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-20 w-20 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payroll Runs Yet</h3>
              <p className="text-gray-500 mb-6">Create your first payroll run to get started</p>
              <Link href="/dashboard/payroll/new">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Payroll
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {payrollRuns.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h3>
                <p className="text-sm text-gray-600">Common payroll operations</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/reports">
                  <Button variant="outline" className="bg-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
                <Link href="/dashboard/payroll/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Payroll Run
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
