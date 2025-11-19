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
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { employeeService } from '@/lib/services/data-service'
import { formatDate } from '@/lib/utils'
import { LeaveRequest, Employee } from '@/lib/types'

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)

  // Load data
  useEffect(() => {
    loadLeaveData()
  }, [])

  useEffect(() => {
    filterLeaveRequests()
  }, [searchQuery, statusFilter, leaveRequests])

  const loadLeaveData = () => {
    // Sample leave requests data
    const sampleRequests: LeaveRequest[] = [
      {
        id: '1',
        employeeId: 'emp-001',
        leaveType: 'annual',
        startDate: '2024-12-20',
        endDate: '2024-12-24',
        numberOfDays: 5,
        reason: 'Family vacation during holidays',
        status: 'pending',
        appliedDate: '2024-11-15',
        createdAt: '2024-11-15',
        updatedAt: '2024-11-15'
      },
      {
        id: '2',
        employeeId: 'emp-002',
        leaveType: 'sick',
        startDate: '2024-11-18',
        endDate: '2024-11-19',
        numberOfDays: 2,
        reason: 'Medical appointment and recovery',
        status: 'approved',
        appliedDate: '2024-11-17',
        approvedBy: 'manager-001',
        approvedDate: '2024-11-17',
        createdAt: '2024-11-17',
        updatedAt: '2024-11-17'
      },
      {
        id: '3',
        employeeId: 'emp-003',
        leaveType: 'annual',
        startDate: '2024-12-01',
        endDate: '2024-12-05',
        numberOfDays: 5,
        reason: 'Personal matters',
        status: 'rejected',
        appliedDate: '2024-11-10',
        approvedBy: 'manager-002',
        rejectionReason: 'Critical project deadline',
        createdAt: '2024-11-10',
        updatedAt: '2024-11-12'
      },
    ]
    setLeaveRequests(sampleRequests)
  }

  const filterLeaveRequests = () => {
    let filtered = leaveRequests

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-700'
      case 'sick': return 'bg-red-100 text-red-700'
      case 'maternity': return 'bg-pink-100 text-pink-700'
      case 'paternity': return 'bg-purple-100 text-purple-700'
      case 'unpaid': return 'bg-gray-100 text-gray-700'
      case 'emergency': return 'bg-orange-100 text-orange-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const stats = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    total: leaveRequests.length
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
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pending}</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Manage and approve leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(request.leaveType)}`}>
                        {request.leaveType.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.numberOfDays} {request.numberOfDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Employee: {request.employeeId}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Reason: {request.reason}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied on: {formatDate(request.appliedDate)}
                      {request.approvedDate && ` • Approved on: ${formatDate(request.approvedDate)}`}
                    </p>
                    {request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-md">
                        <p className="text-xs text-red-700">
                          <AlertCircle className="inline h-3 w-3 mr-1" />
                          Rejection reason: {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No leave requests found</p>
                <p className="text-sm mt-1">Try adjusting your filters or create a new request</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6">
            <Calendar className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Leave Calendar</h3>
            <p className="text-sm text-gray-600 mb-4">
              View team leave schedule and availability
            </p>
            <Button variant="outline" className="w-full">
              Open Calendar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6">
            <Users className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Leave Balances</h3>
            <p className="text-sm text-gray-600 mb-4">
              Check employee leave balances and entitlements
            </p>
            <Button variant="outline" className="w-full">
              View Balances
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6">
            <TrendingUp className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Leave Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">
              Analyze leave patterns and trends
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
