'use client'

import { useState } from 'react'
import { Search, Filter, Plus, TrendingUp, Target, Award, AlertCircle, Eye, Edit, Download, Calendar } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  department: string
  designation: string
  reviewPeriod: string
  reviewDate: string
  rating: number
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Overdue'
  reviewer: string
  goals: number
  goalsAchieved: number
}

export default function PerformanceManagementPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Mock data
  const reviews: PerformanceReview[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'Ahmed Al Mansoori',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      reviewPeriod: 'Q4 2024',
      reviewDate: '2024-12-15',
      rating: 4.5,
      status: 'Completed',
      reviewer: 'Sarah Johnson',
      goals: 8,
      goalsAchieved: 7
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Fatima Hassan',
      department: 'Sales',
      designation: 'Sales Manager',
      reviewPeriod: 'Q4 2024',
      reviewDate: '2024-12-20',
      rating: 4.8,
      status: 'Completed',
      reviewer: 'Michael Brown',
      goals: 10,
      goalsAchieved: 9
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'Mohammed Khan',
      department: 'Marketing',
      designation: 'Marketing Executive',
      reviewPeriod: 'Q4 2024',
      reviewDate: '2024-12-18',
      rating: 0,
      status: 'In Progress',
      reviewer: 'Sarah Johnson',
      goals: 6,
      goalsAchieved: 0
    },
    {
      id: '4',
      employeeId: 'EMP004',
      employeeName: 'Aisha Abdullah',
      department: 'HR',
      designation: 'HR Specialist',
      reviewPeriod: 'Q1 2025',
      reviewDate: '2025-01-10',
      rating: 0,
      status: 'Scheduled',
      reviewer: 'John Smith',
      goals: 7,
      goalsAchieved: 0
    },
    {
      id: '5',
      employeeId: 'EMP005',
      employeeName: 'Omar Rashid',
      department: 'Finance',
      designation: 'Accountant',
      reviewPeriod: 'Q3 2024',
      reviewDate: '2024-11-30',
      rating: 0,
      status: 'Overdue',
      reviewer: 'Sarah Johnson',
      goals: 5,
      goalsAchieved: 0
    }
  ]

  const stats = [
    { label: 'Total Reviews', value: '248', change: '+12%', icon: Target, color: 'blue' },
    { label: 'Avg Rating', value: '4.2', change: '+0.3', icon: Award, color: 'green' },
    { label: 'In Progress', value: '12', change: '-5', icon: TrendingUp, color: 'amber' },
    { label: 'Overdue', value: '3', change: '-2', icon: AlertCircle, color: 'red' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Scheduled': return 'bg-purple-100 text-purple-700'
      case 'Overdue': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="text-yellow-400">★</span>)
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<span key={i} className="text-yellow-400">⯨</span>)
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>)
      }
    }
    return stars
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || review.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee performance reviews</p>
        </div>
        <button
          onClick={() => {
            setShowReviewModal(true)
            toast({ title: 'Opening new review form...' })
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Overdue">Overdue</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            More Filters
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Review Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{review.employeeName}</div>
                      <div className="text-sm text-gray-500">{review.employeeId}</div>
                      <div className="text-xs text-gray-400">{review.designation}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.reviewPeriod}</div>
                    <div className="text-xs text-gray-500">{review.reviewDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.rating > 0 ? (
                      <div>
                        <div className="flex items-center gap-1">
                          {getRatingStars(review.rating)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{review.rating.toFixed(1)}/5.0</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Not rated</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {review.goalsAchieved}/{review.goals}
                    </div>
                    {review.goalsAchieved > 0 && (
                      <div className="text-xs text-gray-500">
                        {Math.round((review.goalsAchieved / review.goals) * 100)}% achieved
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.reviewer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast({ title: `Viewing review for ${review.employeeName}` })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast({ title: `Editing review for ${review.employeeName}` })}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Review"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast({ title: `Downloaded review for ${review.employeeName}` })}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Review Cycle Information */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Cycle Information</h3>
            <p className="text-gray-700 mb-4">
              Performance reviews are conducted quarterly to ensure continuous employee development and alignment with organizational goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Q1 Reviews</div>
                <div className="text-xl font-bold text-gray-900">Jan - Mar</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Q2 Reviews</div>
                <div className="text-xl font-bold text-gray-900">Apr - Jun</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Q3 Reviews</div>
                <div className="text-xl font-bold text-gray-900">Jul - Sep</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Q4 Reviews</div>
                <div className="text-xl font-bold text-gray-900">Oct - Dec</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
