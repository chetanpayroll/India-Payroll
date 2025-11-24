"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Download,
  Settings,
  UserCheck,
  UserX,
  Timer,
  Briefcase,
  Loader2,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceRecord {
  id: string
  employeeId: string
  employee: {
    id: string
    employeeNumber: string
    firstName: string
    lastName: string
    designation: string
    department: string
  }
  date: string
  checkInTime?: string
  checkOutTime?: string
  workingHours: number
  status: string
  attendanceType: string
  lateBy?: number
  earlyOutBy?: number
  overtimeHours?: number
  remarks?: string
}

interface AttendanceStatistics {
  present: number
  absent: number
  late: number
  onLeave: number
  halfDay: number
  totalEmployees: number
  attendanceRate: number
}

interface MarkAttendanceForm {
  employeeId: string
  date: string
  status: string
  checkInTime?: string
  checkOutTime?: string
  remarks?: string
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [statistics, setStatistics] = useState<AttendanceStatistics>({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    halfDay: 0,
    totalEmployees: 0,
    attendanceRate: 0
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [showMarkAttendanceDialog, setShowMarkAttendanceDialog] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [markAttendanceForm, setMarkAttendanceForm] = useState<MarkAttendanceForm>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT'
  })

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()

      if (result.success) {
        setEmployees(result.data || [])
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      const startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/attendance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      const result = await response.json()

      if (result.success) {
        setAttendanceRecords(result.data || [])
      } else {
        toast.error('Failed to load attendance records')
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch(`/api/attendance/statistics?date=${selectedDate}`)
      const result = await response.json()

      if (result.success) {
        setStatistics(result.data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  useEffect(() => {
    loadAttendanceData()
    loadStatistics()
    loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const handleMarkAttendance = async () => {
    try {
      if (!markAttendanceForm.employeeId || !markAttendanceForm.date) {
        toast.error('Employee ID and date are required')
        return
      }

      const payload: any = {
        employeeId: markAttendanceForm.employeeId,
        date: markAttendanceForm.date,
        status: markAttendanceForm.status,
        remarks: markAttendanceForm.remarks,
        isManualEntry: true,
        enteredBy: 'current-user-id' // Replace with actual user ID
      }

      if (markAttendanceForm.checkInTime) {
        payload.checkInTime = `${markAttendanceForm.date}T${markAttendanceForm.checkInTime}:00`
      }

      if (markAttendanceForm.checkOutTime) {
        payload.checkOutTime = `${markAttendanceForm.date}T${markAttendanceForm.checkOutTime}:00`
      }

      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Attendance marked successfully')
        setShowMarkAttendanceDialog(false)
        setMarkAttendanceForm({
          employeeId: '',
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT'
        })
        loadAttendanceData()
        loadStatistics()
      } else {
        toast.error(result.error || 'Failed to mark attendance')
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-700'
      case 'absent':
        return 'bg-red-100 text-red-700'
      case 'late':
        return 'bg-yellow-100 text-yellow-700'
      case 'leave':
        return 'bg-blue-100 text-blue-700'
      case 'half_day':
        return 'bg-orange-100 text-orange-700'
      case 'weekend':
        return 'bg-gray-100 text-gray-700'
      case 'holiday':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A'
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Time & Attendance
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage employee attendance records
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Shift Settings
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setShowMarkAttendanceDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Select Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.present}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.late}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.absent}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-100">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.onLeave}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.totalEmployees}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.attendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-100">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance Log */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Log - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
          <CardDescription>
            {attendanceRecords.length} record{attendanceRecords.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-Out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Working Hours</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No attendance records found for this date
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.employee.firstName} {record.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employee.employeeNumber} • {record.employee.designation}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{formatTime(record.checkInTime)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{formatTime(record.checkOutTime)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {record.workingHours.toFixed(2)} hrs
                        </span>
                        {record.overtimeHours && record.overtimeHours > 0 && (
                          <span className="ml-2 text-xs text-orange-600">
                            (+{record.overtimeHours.toFixed(2)} OT)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 space-y-1">
                          {record.lateBy && record.lateBy > 0 && (
                            <div className="text-yellow-600">Late by {record.lateBy} min</div>
                          )}
                          {record.earlyOutBy && record.earlyOutBy > 0 && (
                            <div className="text-orange-600">Early out by {record.earlyOutBy} min</div>
                          )}
                          {record.remarks && (
                            <div className="text-gray-500">{record.remarks}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance Dialog - Using simple modal since shadcn/ui Dialog might need additional setup */}
      {showMarkAttendanceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
            <p className="text-sm text-gray-600 mb-4">Manually mark attendance for an employee</p>

            <div className="space-y-4">
              <div>
                <Label>Employee *</Label>
                <select
                  value={markAttendanceForm.employeeId}
                  onChange={(e) => setMarkAttendanceForm({ ...markAttendanceForm, employeeId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={markAttendanceForm.date}
                  onChange={(e) => setMarkAttendanceForm({ ...markAttendanceForm, date: e.target.value })}
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={markAttendanceForm.status}
                  onChange={(e) => setMarkAttendanceForm({ ...markAttendanceForm, status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Leave</option>
                  <option value="WEEKEND">Weekend</option>
                  <option value="HOLIDAY">Holiday</option>
                </select>
              </div>

              {markAttendanceForm.status === 'PRESENT' || markAttendanceForm.status === 'LATE' ? (
                <>
                  <div>
                    <Label>Check-In Time (Optional)</Label>
                    <Input
                      type="time"
                      value={markAttendanceForm.checkInTime || ''}
                      onChange={(e) => setMarkAttendanceForm({ ...markAttendanceForm, checkInTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Check-Out Time (Optional)</Label>
                    <Input
                      type="time"
                      value={markAttendanceForm.checkOutTime || ''}
                      onChange={(e) => setMarkAttendanceForm({ ...markAttendanceForm, checkOutTime: e.target.value })}
                    />
                  </div>
                </>
              ) : null}

              <div>
                <Label>Remarks (Optional)</Label>
                <Input
                  placeholder="Enter remarks"
                  value={markAttendanceForm.remarks || ''}
                  onChange={(e) => setMarkAttendanceForm({ ...markAttendanceForm, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowMarkAttendanceDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleMarkAttendance} className="flex-1">
                Mark Attendance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
