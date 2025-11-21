"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  UserCheck,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  BarChart3,
  Download,
  Settings
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const stats = {
    present: 142,
    absent: 5,
    late: 9,
    onLeave: 12,
    totalEmployees: 168
  }

  const attendanceRate = ((stats.present / stats.totalEmployees) * 100).toFixed(1)

  const weeklyData = [
    { day: 'Mon', present: 145, late: 8, absent: 4 },
    { day: 'Tue', present: 148, late: 6, absent: 3 },
    { day: 'Wed', present: 142, late: 9, absent: 5 },
    { day: 'Thu', present: 150, late: 5, absent: 2 },
    { day: 'Fri', present: 138, late: 12, absent: 7 }
  ]

  const departmentData = [
    { name: 'IT', present: 28, absent: 2 },
    { name: 'Sales', present: 35, absent: 1 },
    { name: 'HR', present: 18, absent: 0 },
    { name: 'Finance', present: 22, absent: 1 },
    { name: 'Operations', present: 39, absent: 1 }
  ]

  const pieData = [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'Late', value: stats.late, color: '#f59e0b' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' },
    { name: 'On Leave', value: stats.onLeave, color: '#3b82f6' }
  ]

  const recentAttendance = [
    { employee: 'John Smith', checkIn: '08:45 AM', checkOut: '05:30 PM', status: 'present', hours: '8.75' },
    { employee: 'Sarah Johnson', checkIn: '09:15 AM', checkOut: '06:00 PM', status: 'late', hours: '8.75' },
    { employee: 'Mike Wilson', checkIn: '-', checkOut: '-', status: 'absent', hours: '0' },
    { employee: 'Emma Davis', checkIn: '08:30 AM', checkOut: '05:15 PM', status: 'present', hours: '8.75' },
    { employee: 'Alex Brown', checkIn: '-', checkOut: '-', status: 'leave', hours: '0' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Time & Attendance
          </h1>
          <p className="mt-2 text-gray-600">
            Track employee attendance, shifts, and working hours
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Shift Settings
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
            <UserCheck className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.present}</p>
                <p className="text-xs text-gray-500 mt-1">{attendanceRate}% attendance</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.late}</p>
                <p className="text-xs text-gray-500 mt-1">Arrived late today</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.absent}</p>
                <p className="text-xs text-gray-500 mt-1">Without leave</p>
              </div>
              <div className="p-3 rounded-xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.onLeave}</p>
                <p className="text-xs text-gray-500 mt-1">Approved leave</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                <p className="text-xs text-gray-500 mt-1">Active employees</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Weekly Attendance Trend
            </CardTitle>
            <CardDescription>Attendance pattern for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Today&apos;s Distribution
            </CardTitle>
            <CardDescription>Current day attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Attendance */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Department-wise Attendance
          </CardTitle>
          <CardDescription>Today&apos;s attendance by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" radius={[0, 8, 8, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Today&apos;s Attendance Log
          </CardTitle>
          <CardDescription>Real-time attendance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Employee</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Check In</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Check Out</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Hours</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{record.employee}</td>
                    <td className="p-3 text-gray-600">{record.checkIn}</td>
                    <td className="p-3 text-gray-600">{record.checkOut}</td>
                    <td className="p-3 text-gray-600">{record.hours} hrs</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'late' ? 'bg-orange-100 text-orange-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
