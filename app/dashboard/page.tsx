"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  CheckCircle2,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Building2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Card3D from '@/components/Card3D'
import Button3D from '@/components/Button3D'
import ParallaxSection from '@/components/ParallaxSection'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'

// Mock Data Generators (Replace with API calls later)
const generatePayrollTrend = () => [
  { month: 'Oct', gross: 4500000, net: 4100000, deductions: 400000 },
  { month: 'Nov', gross: 4550000, net: 4150000, deductions: 400000 },
  { month: 'Dec', gross: 4800000, net: 4350000, deductions: 450000 }, // Bonus
  { month: 'Jan', gross: 4600000, net: 4200000, deductions: 400000 },
  { month: 'Feb', gross: 4650000, net: 4250000, deductions: 400000 },
  { month: 'Mar', gross: 4700000, net: 4280000, deductions: 420000 }, // Yearend
]

const deptDistribution = [
  { name: 'Engineering', value: 45 },
  { name: 'Sales', value: 30 },
  { name: 'HR & Admin', value: 15 },
  { name: 'Finance', value: 10 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 124,
    activeEmployees: 118,
    monthlyPayroll: 4567890,
    complianceStatus: 'Good',
    pendingApprovals: 5,
    nextTaxExit: '15th Apr'
  })

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const complianceEvents = [
    { name: 'PF ECR Filing', date: '15th Apr', status: 'pending', urgent: true },
    { name: 'ESI Return', date: '21st Apr', status: 'pending', urgent: false },
    { name: 'TDS Payment', date: '7th May', status: 'upcoming', urgent: false },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Admin. Here's your payroll overview for <span className="font-semibold text-blue-600">April 2024</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/payroll">
            <Button3D variant="primary" magnetic className="px-6">
              <IndianRupee className="mr-2 h-4 w-4" />
              Run Payroll
            </Button3D>
          </Link>
          <Button3D variant="secondary" magnetic>
            <Download className="mr-2 h-4 w-4" />
            Reports
          </Button3D>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <ParallaxSection speed={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Employees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card3D className="border-0 h-full" glassEffect={true} intensity={10}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{stats.totalEmployees}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.activeEmployees} Active | {stats.totalEmployees - stats.activeEmployees} Inactive
                </p>
              </CardContent>
            </Card3D>
          </motion.div>

          {/* Monthly Payroll */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card3D className="border-0 h-full" glassEffect={true} intensity={10}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <IndianRupee className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                    Processed
                  </span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Last Month Payroll</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  ₹{(stats.monthlyPayroll / 100000).toFixed(2)} L
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  Avg Salary: ₹{Math.round(stats.monthlyPayroll / stats.activeEmployees).toLocaleString()}
                </p>
              </CardContent>
            </Card3D>
          </motion.div>

          {/* Compliance Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card3D className="border-0 h-full" glassEffect={true} intensity={10}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Action Req
                  </span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Compliance</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">PF Due</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Due in 3 days (15th Apr)
                </p>
              </CardContent>
            </Card3D>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card3D className="border-0 h-full" glassEffect={true} intensity={10}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{stats.pendingApprovals}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Leave & Regularization requests
                </p>
              </CardContent>
            </Card3D>
          </motion.div>
        </div>
      </ParallaxSection>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Trend */}
        <div className="lg:col-span-2">
          <Card3D className="border-0 h-full shadow-lg" glassEffect={true}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Payroll Trends
              </CardTitle>
              <CardDescription>
                Gross Earnings vs Net Pay (Last 6 Months)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generatePayrollTrend()}>
                    <defs>
                      <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value / 100000}L`}
                    />
                    <Tooltip
                      formatter={(value: any) => `₹${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="gross"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorGross)"
                      name="Gross Pay"
                    />
                    <Area
                      type="monotone"
                      dataKey="net"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorNet)"
                      name="Net Pay"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card3D>
        </div>

        {/* Quick Actions & Compliance Calendar */}
        <div className="space-y-6">
          <Card3D className="border-0 shadow-lg" glassEffect={true}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Compliance Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${event.urgent ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{event.name}</p>
                        <p className="text-xs text-gray-500">Due: {event.date}</p>
                      </div>
                    </div>
                    {event.status === 'pending' ? (
                      <Button size="sm" variant="outline" className="h-8 text-xs">File Now</Button>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">Upcoming</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card3D>

          <Card3D className="border-0 shadow-lg" glassEffect={true}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-orange-600" />
                Department Split
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {deptDistribution.map((dept, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {dept.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card3D>
        </div>
      </div>
    </div>
  )
}
