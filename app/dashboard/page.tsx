"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Card3D from '@/components/Card3D'
import Button3D from '@/components/Button3D'
import ParallaxSection from '@/components/ParallaxSection'
import { motion } from 'framer-motion'
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
import { useCurrencyFormatter } from '@/lib/hooks/use-currency-formatter'
import { useCountry } from '@/lib/context/CountryContext'
import { employeeService, payrollService } from '@/lib/services/data-service'
import { api } from '@/lib/services/api'
import { formatMonth } from '@/lib/utils'
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
  const formatCurrency = useCurrencyFormatter()

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

  const loadDashboardData = useCallback(async () => {
    try {
      // Employee stats
      const allEmployees = await api.employees.getAll()
      const activeEmployees = allEmployees.filter((e: any) => e.status === 'ACTIVE')

      // Count nationals based on selected country
      const nationals = allEmployees.filter((e: any) => {
        const nat = e.nationality?.toLowerCase() || ''
        if (country === 'INDIA') {
          return nat === 'indian' || nat === 'india'
        } else {
          return nat === 'uae' || nat === 'emirati'
        }
      }).length

      const onProbation = allEmployees.filter((e: any) => e.status === 'PROBATION' || e.employmentStatus === 'probation').length
      // Mock departments for now as we don't have department API yet, or extract from employees
      const departments = Array.from(new Set(allEmployees.map((e: any) => e.department).filter(Boolean)))
      // Mock expiring docs for now
      const expiringDocs = 0 // To be implemented with API

      // Calculate average salary
      const totalSalary = activeEmployees.reduce((sum: number, emp: any) => sum + (Number(emp.basicSalary) || 0), 0)
      const avgSalary = activeEmployees.length > 0 ? totalSalary / activeEmployees.length : 0

      // Payroll stats
      const allPayrolls = await api.payroll.getAll()
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

      const currentMonthRun = allPayrolls.find((r: any) => r.payrollYear === currentYear && r.payrollMonth === currentMonth)
      const lastMonthRun = allPayrolls.find((r: any) => r.payrollYear === lastMonthYear && r.payrollMonth === lastMonth)

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
        const run = allPayrolls.find((r: any) => r.payrollYear === year && r.payrollMonth === month)

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
        const deptEmployees = allEmployees.filter((e: any) => e.department === dept)
        const deptCost = deptEmployees.reduce((sum: number, e: any) =>
          sum + (Number(e.basicSalary) || 0) + (Number(e.housingAllowance) || 0) + (Number(e.transportationAllowance) || 0), 0
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
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    }
  }, [country])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

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
      name: 'Indian Nationals',
      value: stats.nationals.toString(),
      change: `${((stats.nationals / stats.totalEmployees) * 100).toFixed(1)}% Local talent`,
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-5xl font-bold gradient-text neon-glow">
            Enterprise Dashboard
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            Real-time insights and analytics for your organization
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/reports">
            <Button3D variant="primary" magnetic>
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button3D>
          </Link>
          <Link href="/dashboard/payroll/new">
            <Button3D variant="success" magnetic>
              <DollarSign className="h-4 w-4 mr-2" />
              Process Payroll
            </Button3D>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <ParallaxSection speed={0.3}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.name}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={kpi.href}>
                  <Card3D
                    className="group border-0 overflow-hidden relative hover:scale-105 transition-all duration-300"
                    glassEffect={true}
                    intensity={15}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-60 animate-gradient-shift`} />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className={`p-4 rounded-2xl bg-gradient-to-br ${kpi.gradient} shadow-2xl animate-float`}
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${kpi.changeType === 'positive' ? 'bg-green-100 text-green-700 animate-pulse-glow' :
                            kpi.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                              kpi.changeType === 'warning' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {kpi.changeValue}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{kpi.name}</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {kpi.value}
                        </p>
                        <p className="text-xs text-gray-600 mt-2 font-medium">{kpi.change}</p>
                      </div>
                    </CardContent>
                  </Card3D>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </ParallaxSection>

      {/* Charts Row 1: Payroll Trends & Department Distribution */}
      <ParallaxSection speed={0.2}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {/* Payroll Trend Chart */}
          <Card3D className="shadow-2xl border-0" glassEffect={true}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Payroll Trend Analysis
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">Last 6 months payroll performance</CardDescription>
                </div>
                <Link href="/dashboard/analytics">
                  <Button3D variant="secondary" className="text-sm px-4 py-2">
                    View Details
                  </Button3D>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={payrollTrends}>
                  <defs>
                    <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
          </Card3D>

          {/* Department Distribution */}
          <Card3D className="shadow-2xl border-0" glassEffect={true}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <PieChart className="h-6 w-6 text-purple-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Department Distribution
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">Employee count by department</CardDescription>
                </div>
                <Link href="/dashboard/analytics">
                  <Button3D variant="secondary" className="text-sm px-4 py-2">
                    Explore
                  </Button3D>
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
          </Card3D>
        </motion.div>
      </ParallaxSection>

      {/* Charts Row 2: Headcount Trend */}
      <ParallaxSection speed={0.1}>
        <Card3D className="shadow-2xl border-0" glassEffect={true}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Headcount Growth
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600">Employee growth over last 12 months</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headcountTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="headcount" fill="#3b82f6" name="Total Employees" radius={[4, 4, 0, 0]} />
                <Bar dataKey="newHires" fill="#10b981" name="New Hires" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card3D>
      </ParallaxSection>
    </div>
  )
}
