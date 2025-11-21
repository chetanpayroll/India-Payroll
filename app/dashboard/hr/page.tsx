"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Briefcase,
  Users,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Award,
  FileText,
  BarChart3,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  PieChart,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default function HRManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)

  const hrReports = [
    { id: 'headcount', name: 'Headcount Report', description: 'Employee count by department, location, and status' },
    { id: 'turnover', name: 'Turnover Analysis', description: 'Employee retention and attrition metrics' },
    { id: 'attendance', name: 'Attendance Summary', description: 'Attendance patterns and trends' },
    { id: 'leave', name: 'Leave Utilization', description: 'Leave balances and usage statistics' },
    { id: 'performance', name: 'Performance Summary', description: 'Performance ratings distribution' },
    { id: 'training', name: 'Training Completion', description: 'Training program completion rates' },
  ]

  const modules = [
    {
      name: 'Performance Reviews',
      icon: Target,
      description: 'Manage employee performance evaluations and goal tracking',
      stats: { pending: 5, completed: 23, upcoming: 8 },
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      href: '/dashboard/hr/performance'
    },
    {
      name: 'Recruitment',
      icon: UserPlus,
      description: 'Track job requisitions, candidates, and hiring pipeline',
      stats: { openPositions: 7, activeCV: 34, interviews: 12 },
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      href: '/dashboard/hr/recruitment'
    },
    {
      name: 'Training & Development',
      icon: GraduationCap,
      description: 'Manage training programs and employee skill development',
      stats: { programs: 12, enrolled: 45, completed: 78 },
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      href: '/dashboard/hr/training'
    },
    {
      name: 'Onboarding',
      icon: CheckCircle2,
      description: 'Streamline new employee onboarding process',
      stats: { inProgress: 3, completed: 15, upcoming: 5 },
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      href: '/dashboard/hr/onboarding'
    }
  ]

  const kpiData = [
    {
      title: 'Total Employees',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'New Hires (MTD)',
      value: '8',
      change: '+3 vs last month',
      changeType: 'positive',
      icon: UserPlus,
      color: 'green'
    },
    {
      title: 'Turnover Rate',
      value: '4.2%',
      change: '-1.5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Avg Tenure',
      value: '3.2 years',
      change: '+0.3 years',
      changeType: 'positive',
      icon: Clock,
      color: 'orange'
    }
  ]

  const recentActivities = [
    { type: 'performance', title: 'Q4 Performance Reviews Started', date: '2024-11-15', status: 'in_progress' },
    { type: 'recruitment', title: '5 New Candidates Added', date: '2024-11-14', status: 'completed' },
    { type: 'training', title: 'Leadership Training Completed', date: '2024-11-12', status: 'completed' },
    { type: 'onboarding', title: '3 Employees Onboarded Successfully', date: '2024-11-10', status: 'completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            HR Management
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive human resource management and employee lifecycle
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsReportsModalOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            HR Reports
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => setIsAnalyticsModalOpen(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            HR Analytics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    kpi.color === 'blue' ? 'bg-blue-100' :
                    kpi.color === 'green' ? 'bg-green-100' :
                    kpi.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      kpi.color === 'blue' ? 'text-blue-600' :
                      kpi.color === 'green' ? 'text-green-600' :
                      kpi.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <span className="text-xs font-semibold text-green-600">{kpi.change}</span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* HR Modules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.name} href={module.href}>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden relative cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${module.bgGradient} opacity-30`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${module.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{module.name}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    {Object.entries(module.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activities */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Recent HR Activities
          </CardTitle>
          <CardDescription>Latest updates across HR modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <CheckCircle2 className={`h-5 w-5 ${
                      activity.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {activity.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <Award className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Performance Excellence</h3>
            <p className="text-3xl font-bold mb-2">87%</p>
            <p className="text-sm opacity-90">Average performance score this quarter</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <GraduationCap className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Training Completion</h3>
            <p className="text-3xl font-bold mb-2">92%</p>
            <p className="text-sm opacity-90">Employees completed mandatory training</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <TrendingUp className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Employee Satisfaction</h3>
            <p className="text-3xl font-bold mb-2">4.6/5</p>
            <p className="text-sm opacity-90">Based on latest engagement survey</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Reports Modal */}
      <Dialog open={isReportsModalOpen} onOpenChange={setIsReportsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              HR Reports
            </DialogTitle>
            <DialogDescription>
              Generate and download HR reports
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {hrReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HR Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              HR Analytics Dashboard
            </DialogTitle>
            <DialogDescription>
              Key HR metrics and insights
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-500">Total Employees</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <UserPlus className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-500">New Hires (MTD)</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <Activity className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">4.2%</p>
                <p className="text-xs text-gray-500">Turnover Rate</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <Award className="h-6 w-6 mx-auto text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-xs text-gray-500">Avg Performance</p>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                Headcount by Department
              </h4>
              <div className="space-y-3">
                {[
                  { dept: 'Operations', count: 45, percent: 29, color: 'bg-blue-500' },
                  { dept: 'Finance', count: 32, percent: 21, color: 'bg-green-500' },
                  { dept: 'IT', count: 28, percent: 18, color: 'bg-purple-500' },
                  { dept: 'HR', count: 18, percent: 12, color: 'bg-orange-500' },
                  { dept: 'Sales', count: 33, percent: 21, color: 'bg-pink-500' },
                ].map((item) => (
                  <div key={item.dept} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600">{item.dept}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                    <span className="w-16 text-sm text-gray-900 text-right">{item.count} ({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trends */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Hiring Trend</h4>
                <div className="flex items-end gap-1 h-20">
                  {[30, 45, 35, 55, 40, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-500 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Attrition Trend</h4>
                <div className="flex items-end gap-1 h-20">
                  {[25, 20, 30, 15, 20, 18].map((h, i) => (
                    <div key={i} className="flex-1 bg-red-400 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalyticsModalOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
