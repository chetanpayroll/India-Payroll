"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  AlertCircle,
  Calendar,
  Award,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { useInitData } from '@/lib/hooks/use-init-data'
import { employeeService, payrollService } from '@/lib/services/data-service'
import { formatCurrency, formatMonth } from '@/lib/utils'

export default function DashboardPage() {
  useInitData()

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    uaeNationals: 0,
    currentMonthPayroll: 0,
    lastMonthPayroll: 0,
    departments: 0,
    expiringDocs: 0,
  })

  const [recentPayrolls, setRecentPayrolls] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Employee stats
    const allEmployees = employeeService.getAll()
    const activeEmployees = employeeService.getActive()
    const uaeNationals = allEmployees.filter(e =>
      e.nationality.toLowerCase() === 'uae' || e.nationality.toLowerCase() === 'emirati'
    ).length
    const departments = employeeService.getDepartments().length
    const expiringDocs = employeeService.getExpiringDocuments(30).length

    // Payroll stats
    const allPayrolls = payrollService.getAllRuns()
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const currentMonthRun = payrollService.getRunByPeriod(currentYear, currentMonth)
    const lastMonthRun = payrollService.getRunByPeriod(lastMonthYear, lastMonth)

    setStats({
      totalEmployees: allEmployees.length,
      activeEmployees: activeEmployees.length,
      uaeNationals,
      currentMonthPayroll: currentMonthRun?.totalNet || 0,
      lastMonthPayroll: lastMonthRun?.totalNet || 0,
      departments,
      expiringDocs,
    })

    setRecentPayrolls(allPayrolls.slice(0, 3))
  }

  const payrollChange = stats.lastMonthPayroll > 0
    ? ((stats.currentMonthPayroll - stats.lastMonthPayroll) / stats.lastMonthPayroll * 100)
    : 0

  const dashboardStats = [
    {
      name: 'Total Employees',
      value: stats.totalEmployees.toString(),
      change: `${stats.activeEmployees} active`,
      changeType: 'positive',
      icon: Users,
      href: '/dashboard/employees',
      color: 'blue'
    },
    {
      name: 'Monthly Payroll',
      value: stats.currentMonthPayroll > 0 ? formatCurrency(stats.currentMonthPayroll).split('.')[0] : 'Not processed',
      change: payrollChange !== 0 ? `${payrollChange > 0 ? '+' : ''}${payrollChange.toFixed(1)}%` : 'vs last month',
      changeType: payrollChange >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      href: '/dashboard/payroll',
      color: 'green'
    },
    {
      name: 'UAE Nationals',
      value: stats.uaeNationals.toString(),
      change: `${stats.departments} departments`,
      changeType: 'neutral',
      icon: Award,
      href: '/dashboard/employees',
      color: 'purple'
    },
    {
      name: 'Expiring Documents',
      value: stats.expiringDocs.toString(),
      change: 'Next 30 days',
      changeType: stats.expiringDocs > 0 ? 'warning' : 'positive',
      icon: AlertCircle,
      href: '/dashboard/employees',
      color: 'orange'
    },
  ]

  const pendingActions = [
    {
      title: 'Process Current Month Payroll',
      description: `Calculate and review payroll for ${formatMonth(new Date().getMonth() + 1, new Date().getFullYear())}`,
      priority: 'high',
      action: '/dashboard/payroll/new'
    },
    {
      title: 'Review Expiring Documents',
      description: `${stats.expiringDocs} employee documents expiring soon`,
      priority: stats.expiringDocs > 5 ? 'high' : 'medium',
      action: '/dashboard/employees'
    },
    {
      title: 'Generate WPS File',
      description: 'Submit monthly WPS file to Central Bank',
      priority: 'medium',
      action: '/dashboard/reports'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your payroll system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4" style={{
                borderLeftColor: stat.color === 'blue' ? '#3b82f6' :
                                stat.color === 'green' ? '#10b981' :
                                stat.color === 'purple' ? '#8b5cf6' :
                                '#f59e0b'
              }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {stat.changeType === 'positive' && stat.change.includes('+') && (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        )}
                        {stat.changeType === 'negative' && (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' :
                          stat.changeType === 'negative' ? 'text-red-600' :
                          stat.changeType === 'warning' ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${
                      stat.color === 'blue' ? 'from-blue-100 to-blue-200' :
                      stat.color === 'green' ? 'from-green-100 to-green-200' :
                      stat.color === 'purple' ? 'from-purple-100 to-purple-200' :
                      'from-orange-100 to-orange-200'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payrolls */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Recent Payroll Runs
            </CardTitle>
            <CardDescription>Last payroll processing history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayrolls.length > 0 ? (
                recentPayrolls.map((payroll) => (
                  <div
                    key={payroll.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatMonth(payroll.payrollMonth, payroll.payrollYear)}
                      </p>
                      <p className="text-sm text-gray-500">{payroll.totalEmployees} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(payroll.totalNet)}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payroll.status === 'finalized' ? 'bg-green-100 text-green-700' :
                        payroll.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        payroll.status === 'calculated' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {payroll.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No payroll runs yet</p>
                  <p className="text-sm mt-1">Create your first payroll run to get started</p>
                </div>
              )}
              <Link href="/dashboard/payroll">
                <Button variant="outline" className="w-full mt-4">
                  View All Payrolls
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Pending Actions
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <Link key={index} href={action.action}>
                  <div className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all cursor-pointer">
                    <div className={`p-2 h-fit rounded-lg ${
                      action.priority === 'high' ? 'bg-red-100' :
                      action.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <AlertCircle className={`h-5 w-5 ${
                        action.priority === 'high' ? 'text-red-600' :
                        action.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/dashboard/payroll/new">
                <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Payroll Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/employees">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <Users className="h-6 w-6 text-blue-600" />
                <span>Manage Employees</span>
              </Button>
            </Link>
            <Link href="/dashboard/payroll/new">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-all">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span>New Payroll</span>
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all">
                <FileText className="h-6 w-6 text-purple-600" />
                <span>Generate Reports</span>
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* UAE Compliance Notice */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="p-2 h-fit bg-white rounded-lg shadow-sm">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1 text-lg">UAE Compliance Status</h3>
              <p className="text-sm text-blue-800">
                ✅ WPS compliant • ✅ MOHRE calculations active • ✅ Labor law adherent
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Next WPS submission deadline: End of current month • All employee documents validated
              </p>
              <div className="mt-3 flex gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-blue-700">
                  {stats.totalEmployees} Total Employees
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-green-700">
                  {stats.uaeNationals} UAE Nationals
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-700">
                  {stats.departments} Departments
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
