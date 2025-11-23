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
  Plus,
  Search,
  Filter,
  Download,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface LeaveRequest {
  id: string
  employeeId: string
  employee?: {
    id: string
    employeeNumber: string
    firstName: string
    lastName: string
    email: string
    designation: string
    department: string
  }
  leaveType: string
  startDate: string
  endDate: string
  numberOfDays: number
  reason?: string
  status: string
  appliedDate: string
  approvedBy?: string
  approver?: {
    id: string
    name: string
    email: string
  }
  approvedDate?: string
  rejectionReason?: string
  attachmentUrl?: string
  createdAt: string
  updatedAt: string
}

interface LeaveStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [statistics, setStatistics] = useState<LeaveStatistics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Load data
  useEffect(() => {
    loadLeaveData()
    loadStatistics()
  }, [])

  useEffect(() => {
    let filtered = leaveRequests

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status.toUpperCase() === statusFilter.toUpperCase())
    }

    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.employee?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.employee?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.employee?.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }, [searchQuery, statusFilter, leaveRequests])

  const loadLeaveData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leave/requests')
      const result = await response.json()

      if (result.success) {
        setLeaveRequests(result.data || [])
      } else {
        toast.error('Failed to load leave requests')
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error loading leave requests:', error)
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/leave/statistics')
      const result = await response.json()

      if (result.success) {
        setStatistics(result.data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const handleApprove = async (leaveId: string) => {
    try {
      setActionLoading(leaveId)
      const response = await fetch(`/api/leave/requests/${leaveId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approvedBy: 'current-user-id' // Replace with actual user ID from session
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Leave request approved successfully')
        loadLeaveData()
        loadStatistics()
      } else {
        toast.error(result.error || 'Failed to approve leave request')
      }
    } catch (error) {
      console.error('Error approving leave:', error)
      toast.error('Failed to approve leave request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (leaveId: string) => {
    const rejectionReason = prompt('Please enter rejection reason:')
    if (!rejectionReason) return

    try {
      setActionLoading(leaveId)
      const response = await fetch(`/api/leave/requests/${leaveId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approvedBy: 'current-user-id', // Replace with actual user ID from session
          rejectionReason
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Leave request rejected')
        loadLeaveData()
        loadStatistics()
      } else {
        toast.error(result.error || 'Failed to reject leave request')
      }
    } catch (error) {
      console.error('Error rejecting leave:', error)
      toast.error('Failed to reject leave request')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual': return 'bg-blue-100 text-blue-700'
      case 'sick': return 'bg-red-100 text-red-700'
      case 'maternity': return 'bg-pink-100 text-pink-700'
      case 'paternity': return 'bg-purple-100 text-purple-700'
      case 'unpaid': return 'bg-gray-100 text-gray-700'
      case 'emergency': return 'bg-orange-100 text-orange-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            Leave Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage employee leave requests and balances
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Leave Policies
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting decision</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.approved}</p>
                <p className="text-xs text-gray-500 mt-1">This period</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">This period</p>
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
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.total}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by employee, type, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status Filter</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
                <p className="text-gray-500">
                  {statusFilter !== 'all'
                    ? 'Try changing the status filter'
                    : 'There are no leave requests to display'}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                          {request.leaveType.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                        {request.employee && (
                          <span className="text-sm text-gray-600">
                            {request.employee.firstName} {request.employee.lastName} ({request.employee.employeeNumber})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </span>
                          <span className="ml-2 font-medium">({request.numberOfDays} days)</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Applied: {new Date(request.appliedDate).toLocaleDateString()}
                        </div>
                      </div>

                      {request.reason && (
                        <p className="mt-2 text-sm text-gray-700">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      )}

                      {request.status.toLowerCase() === 'approved' && request.approver && (
                        <p className="mt-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Approved by {request.approver.name} on {new Date(request.approvedDate!).toLocaleDateString()}
                        </p>
                      )}

                      {request.status.toLowerCase() === 'rejected' && request.rejectionReason && (
                        <p className="mt-2 text-sm text-red-600">
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Rejected: {request.rejectionReason}
                        </p>
                      )}
                    </div>

                    {request.status.toLowerCase() === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
