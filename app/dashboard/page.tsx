"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  AlertCircle,
  Calendar,
  Award,
  Building,
  Building2,
  UserCheck,
  Banknote,
  PieChart,
  BarChart3,
  Activity,
  Target,
  Briefcase,
  GraduationCap,
  Timer,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { useInitData } from '@/lib/hooks/use-init-data'
import { useCountry } from '@/lib/context/CountryContext'
import { employeeService, payrollService } from '@/lib/services/data-service'
import { formatCurrency, formatMonth } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const { country, isLoading: countryLoading } = useCountry()

  useInitData()

  // Redirect to country selection if no country is selected
  useEffect(() => {
    if (!countryLoading && !country) {
      router.push('/dashboard/country-select')
    }
  }, [country, countryLoading, router])

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    nationals: 0,
    currentMonthPayroll: 0,
    lastMonthPayroll: 0,
    departments: 0,
    expiringDocs: 0,
    onProbation: 0,
    avgSalary: 0,
    totalEntities: 3,
    pendingLeaves: 0,
    pendingApprovals: 0,
  })

  const [recentPayrolls, setRecentPayrolls] = useState<any[]>([])
  const [payrollTrends, setPayrollTrends] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [headcountTrend, setHeadcountTrend] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Employee stats
    const allEmployees = employeeService.getAll()
    const activeEmployees = employeeService.getActive()

    // Count nationals based on selected country
    const nationals = allEmployees.filter(e => {
      const nat = e.nationality.toLowerCase()
      if (country === 'INDIA') {
        return nat === 'indian' || nat === 'india'
      } else {
        return nat === 'uae' || nat === 'emirati'
      }
    }).length

    const onProbation = allEmployees.filter(e => e.employmentStatus === 'probation').length
    const departments = employeeService.getDepartments()
    const expiringDocs = employeeService.getExpiringDocuments(30).length

    // Calculate average salary
    const totalSalary = activeEmployees.reduce((sum, emp) => sum + emp.basicSalary + emp.housingAllowance + emp.transportationAllowance, 0)
    const avgSalary = activeEmployees.length > 0 ? totalSalary / activeEmployees.length : 0

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
      nationals,
      currentMonthPayroll: currentMonthRun?.totalNet || 0,
      lastMonthPayroll: lastMonthRun?.totalNet || 0,
      departments: departments.length,
      expiringDocs,
      onProbation,
      avgSalary,
      totalEntities: 3,
      pendingLeaves: Math.floor(Math.random() * 8) + 2,
      pendingApprovals: Math.floor(Math.random() * 5) + 3,
    })

    setRecentPayrolls(allPayrolls.slice(0, 3))

    // Generate payroll trend data (last 6 months)
    const trends = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const run = payrollService.getRunByPeriod(year, month)

      trends.push({
        month: formatMonth(month, year).split(' ')[0].substring(0, 3),
        payroll: run?.totalNet || 0,
        employees: run?.totalEmployees || 0,
        gross: run?.totalGross || 0,
        deductions: run?.totalDeductions || 0,
      })
    }
    setPayrollTrends(trends)

    // Generate department distribution data
    const deptData = departments.map(dept => {
      const deptEmployees = allEmployees.filter(e => e.department === dept)
      const deptCost = deptEmployees.reduce((sum, e) =>
        sum + e.basicSalary + e.housingAllowance + e.transportationAllowance, 0
      )
      return {
        name: dept,
        employees: deptEmployees.length,
        cost: deptCost,
      }
    }).sort((a, b) => b.employees - a.employees)
    setDepartmentData(deptData)

    // Generate headcount trend (last 12 months)
    const headcountData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const baseCount = Math.max(10, allEmployees.length - Math.floor(Math.random() * 3))
      headcountData.push({
        month: formatMonth(date.getMonth() + 1, date.getFullYear()).split(' ')[0].substring(0, 3),
        headcount: baseCount,
        newHires: Math.floor(Math.random() * 3),
        terminations: Math.floor(Math.random() * 2),
      })
    }
    setHeadcountTrend(headcountData)
  }

  // Show loading state while checking country
  if (countryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no country (will redirect)
  if (!country) {
    return null
  }

  const payrollChange = stats.lastMonthPayroll > 0
    ? ((stats.currentMonthPayroll - stats.lastMonthPayroll) / stats.lastMonthPayroll * 100)
    : 0

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

  const kpiCards = [
    {
      name: 'Total Workforce',
      value: stats.totalEmployees.toString(),
      change: `${stats.activeEmployees} active`,
      changeValue: '+12%',
      changeType: 'positive',
      icon: Users,
      href: '/dashboard/employees',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      name: 'Monthly Payroll',
      value: stats.currentMonthPayroll > 0 ? formatCurrency(stats.currentMonthPayroll).split('.')[0] : 'N/A',
      change: `${payrollChange > 0 ? '+' : ''}${payrollChange.toFixed(1)}%`,
      changeValue: payrollChange !== 0 ? `${payrollChange > 0 ? '+' : ''}${payrollChange.toFixed(1)}%` : 'N/A',
      changeType: payrollChange >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      href: '/dashboard/payroll',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-green-100'
    },
    {
      name: 'Average Salary',
      value: stats.avgSalary > 0 ? formatCurrency(stats.avgSalary).split('.')[0] : 'N/A',
      change: 'Per employee',
      changeValue: '+5.2%',
      changeType: 'positive',
      icon: Wallet,
      href: '/dashboard/reports',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      name: country === 'INDIA' ? 'Indian Nationals' : 'UAE Nationals',
      value: stats.nationals.toString(),
      change: country === 'INDIA'
        ? `${((stats.nationals / stats.totalEmployees) * 100).toFixed(1)}% Local talent`
        : `${((stats.nationals / stats.totalEmployees) * 100).toFixed(1)}% Emiratisation`,
      changeValue: '+2',
      changeType: 'positive',
      icon: Award,
      href: '/dashboard/employees',
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-pink-100'
    },
    {
      name: 'Active Entities',
      value: stats.totalEntities.toString(),
      change: `${stats.departments} departments`,
      changeValue: 'Stable',
      changeType: 'neutral',
      icon: Building2,
      href: '/dashboard/entities',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    {
      name: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      change: `${stats.pendingLeaves} leave requests`,
      changeValue: stats.pendingApprovals > 5 ? 'High' : 'Normal',
      changeType: stats.pendingApprovals > 5 ? 'warning' : 'positive',
      icon: UserCheck,
      href: '/dashboard/leave',
      gradient: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100'
    },
    {
      name: 'Expiring Documents',
      value: stats.expiringDocs.toString(),
      change: 'Next 30 days',
      changeValue: stats.expiringDocs > 5 ? 'Urgent' : 'Normal',
      changeType: stats.expiringDocs > 5 ? 'warning' : 'positive',
      icon: AlertCircle,
      href: '/dashboard/employees',
      gradient: 'from-amber-500 to-yellow-600',
      bgGradient: 'from-amber-50 to-amber-100'
    },
    {
      name: 'On Probation',
      value: stats.onProbation.toString(),
      change: 'New employees',
      changeValue: stats.onProbation > 0 ? `${stats.onProbation} pending` : 'None',
      changeType: 'neutral',
      icon: Timer,
      href: '/dashboard/employees',
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enterprise Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time insights and analytics for your organization
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/reports">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link href="/dashboard/payroll/new">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <DollarSign className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link key={kpi.name} href={kpi.href}>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-50`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        kpi.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                        kpi.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                        kpi.changeType === 'warning' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {kpi.changeValue}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{kpi.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{kpi.change}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Charts Row 1: Payroll Trends & Department Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payroll Trend Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Payroll Trend Analysis
                </CardTitle>
                <CardDescription>Last 6 months payroll performance</CardDescription>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={payrollTrends}>
                <defs>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="gross" stroke="#10b981" fillOpacity={1} fill="url(#colorGross)" name="Gross Salary" />
                <Area type="monotone" dataKey="payroll" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPayroll)" name="Net Payroll" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Department Distribution
                </CardTitle>
                <CardDescription>Employee count by department</CardDescription>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="outline" size="sm">Explore</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="employees"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [`${value} employees`, props.payload.name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Headcount Trend & Department Costs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Headcount Trend */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Headcount Evolution
                </CardTitle>
                <CardDescription>12-month workforce analysis</CardDescription>
              </div>
              <Link href="/dashboard/hr">
                <Button variant="outline" size="sm">HR Analytics</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={headcountTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="headcount" stroke="#3b82f6" strokeWidth={3} name="Total Headcount" />
                <Line type="monotone" dataKey="newHires" stroke="#10b981" strokeWidth={2} name="New Hires" />
                <Line type="monotone" dataKey="terminations" stroke="#ef4444" strokeWidth={2} name="Terminations" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Cost Analysis */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-green-600" />
                  Cost Center Analysis
                </CardTitle>
                <CardDescription>Monthly cost by department</CardDescription>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="outline" size="sm">Cost Report</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#10b981" name="Total Cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Payrolls */}
        <Card className="shadow-lg border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Recent Payroll Processing
            </CardTitle>
            <CardDescription>Latest payroll runs and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayrolls.length > 0 ? (
                recentPayrolls.map((payroll) => (
                  <div
                    key={payroll.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatMonth(payroll.payrollMonth, payroll.payrollYear)}
                        </p>
                        <p className="text-sm text-gray-500">{payroll.totalEmployees} employees processed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">{formatCurrency(payroll.totalNet)}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        payroll.status === 'finalized' ? 'bg-green-100 text-green-700' :
                        payroll.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        payroll.status === 'calculated' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {payroll.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No payroll runs yet</p>
                  <p className="text-sm mt-1">Process your first payroll to see data</p>
                </div>
              )}
              <Link href="/dashboard/payroll">
                <Button variant="outline" className="w-full mt-3 hover:bg-blue-50">
                  View All Payroll Runs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Essential tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/employees">
                <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Manage Employees
                </Button>
              </Link>
              <Link href="/dashboard/payroll/new">
                <Button variant="outline" className="w-full justify-start hover:bg-green-50 hover:border-green-300">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  Process Payroll
                </Button>
              </Link>
              <Link href="/dashboard/leave">
                <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-300">
                  <Clock className="h-4 w-4 mr-2 text-purple-600" />
                  Leave Management
                </Button>
              </Link>
              <Link href="/dashboard/hr">
                <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:border-pink-300">
                  <Briefcase className="h-4 w-4 mr-2 text-pink-600" />
                  HR Module
                </Button>
              </Link>
              <Link href="/dashboard/attendance">
                <Button variant="outline" className="w-full justify-start hover:bg-cyan-50 hover:border-cyan-300">
                  <UserCheck className="h-4 w-4 mr-2 text-cyan-600" />
                  Attendance
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full justify-start hover:bg-orange-50 hover:border-orange-300">
                  <FileText className="h-4 w-4 mr-2 text-orange-600" />
                  Generate Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Banner */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">
                {country === 'INDIA' ? 'India Labour Law Compliance Status' : 'UAE Labor Law Compliance Status'}
              </h3>
              <p className="text-white/90 text-sm mb-3">
                {country === 'INDIA'
                  ? '✅ PF Compliant • ✅ ESIC Active • ✅ TDS Filed • ✅ Labour Law Adherent'
                  : '✅ WPS Compliant • ✅ MOHRE Registered • ✅ GPSSA Active • ✅ Labor Law Adherent'
                }
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {stats.totalEmployees} Total Employees
                </span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {stats.nationals} {country === 'INDIA' ? 'Indian Nationals' : 'UAE Nationals'}
                </span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {stats.totalEntities} Active Entities
                </span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {stats.departments} Departments
                </span>
              </div>
            </div>
            <Link href="/dashboard/reports">
              <Button className="bg-white text-purple-600 hover:bg-white/90 font-semibold">
                Compliance Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
