"use client"

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
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Demo data
const stats = [
  {
    name: 'Total Employees',
    value: '48',
    change: '+3',
    changeType: 'positive',
    icon: Users,
    href: '/dashboard/employees'
  },
  {
    name: 'Monthly Payroll',
    value: 'AED 245,680',
    change: '+12%',
    changeType: 'positive',
    icon: DollarSign,
    href: '/dashboard/payroll'
  },
  {
    name: 'Pending Approvals',
    value: '2',
    change: '-1',
    changeType: 'neutral',
    icon: Clock,
    href: '/dashboard/payroll'
  },
  {
    name: 'WPS Files Ready',
    value: '1',
    change: 'Due: 30 Nov',
    changeType: 'warning',
    icon: FileText,
    href: '/dashboard/reports'
  },
]

const recentPayrolls = [
  { month: 'October 2024', status: 'Finalized', amount: 'AED 238,450', employees: 47 },
  { month: 'September 2024', status: 'Finalized', amount: 'AED 235,890', employees: 45 },
  { month: 'August 2024', status: 'Finalized', amount: 'AED 232,100', employees: 44 },
]

const pendingActions = [
  { title: 'Review November Payroll', description: 'Calculate and review payroll for November 2024', priority: 'high' },
  { title: 'GPSSA Report Due', description: 'Submit October GPSSA contribution report', priority: 'medium' },
  { title: 'Employee Onboarding', description: '2 new employees awaiting salary setup', priority: 'low' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here&apos;s an overview of your payroll system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {stat.changeType === 'positive' && (
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
                    <div className={`p-3 rounded-xl ${
                      stat.changeType === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        stat.changeType === 'warning' ? 'text-orange-600' : 'text-blue-600'
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Payroll Runs</CardTitle>
            <CardDescription>Last 3 months payroll summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayrolls.map((payroll, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payroll.month}</p>
                    <p className="text-sm text-gray-500">{payroll.employees} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{payroll.amount}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {payroll.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/payroll">
                <Button variant="outline" className="w-full mt-4">
                  View All Payrolls
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
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
              ))}
              <Button className="w-full mt-4">
                Process November Payroll
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/employees/new">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Add Employee</span>
              </Button>
            </Link>
            <Link href="/dashboard/payroll/new">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>New Payroll</span>
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>Generate Reports</span>
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* UAE Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="p-2 h-fit bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">UAE Compliance Status</h3>
              <p className="text-sm text-blue-800">
                ✅ WPS compliant • ✅ GPSSA calculations active • ✅ Labor law adherent
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Next WPS submission deadline: 30th November 2024
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
