'use client'

import { useState } from 'react'
import { Search, Filter, Plus, BookOpen, GraduationCap, Award, TrendingUp, Eye, Edit, Trash2, Users, Calendar, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface TrainingProgram {
  id: string
  title: string
  category: string
  instructor: string
  duration: string
  startDate: string
  endDate: string
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'
  enrolled: number
  capacity: number
  completed: number
  location: string
  mode: 'Online' | 'In-person' | 'Hybrid'
}

interface Participant {
  id: string
  employeeId: string
  employeeName: string
  department: string
  program: string
  enrolledDate: string
  progress: number
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped'
  completionDate?: string
}

export default function TrainingPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'programs' | 'participants'>('programs')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Mock data for training programs
  const programs: TrainingProgram[] = [
    {
      id: 'T001',
      title: 'Leadership & Management Skills',
      category: 'Management',
      instructor: 'Dr. Sarah Johnson',
      duration: '4 weeks',
      startDate: '2024-12-01',
      endDate: '2024-12-28',
      status: 'Upcoming',
      enrolled: 15,
      capacity: 20,
      completed: 0,
      location: 'Mumbai Office',
      mode: 'In-person'
    },
    {
      id: 'T002',
      title: 'Advanced Excel for Business',
      category: 'Technical',
      instructor: 'Mohammed Al Rashid',
      duration: '2 weeks',
      startDate: '2024-11-15',
      endDate: '2024-11-29',
      status: 'In Progress',
      enrolled: 25,
      capacity: 30,
      completed: 12,
      location: 'Online',
      mode: 'Online'
    },
    {
      id: 'T003',
      title: 'Customer Service Excellence',
      category: 'Soft Skills',
      instructor: 'Fatima Hassan',
      duration: '1 week',
      startDate: '2024-10-15',
      endDate: '2024-10-22',
      status: 'Completed',
      enrolled: 30,
      capacity: 30,
      completed: 28,
      location: 'Bangalore Office',
      mode: 'Hybrid'
    },
    {
      id: 'T004',
      title: 'India Labor Law Compliance',
      category: 'Compliance',
      instructor: 'Ahmed Al Mansoori',
      duration: '3 days',
      startDate: '2024-11-20',
      endDate: '2024-11-22',
      status: 'In Progress',
      enrolled: 18,
      capacity: 25,
      completed: 5,
      location: 'Mumbai Office',
      mode: 'In-person'
    },
    {
      id: 'T005',
      title: 'Digital Marketing Fundamentals',
      category: 'Marketing',
      instructor: 'John Smith',
      duration: '3 weeks',
      startDate: '2024-12-10',
      endDate: '2024-12-31',
      status: 'Cancelled',
      enrolled: 8,
      capacity: 20,
      completed: 0,
      location: 'Online',
      mode: 'Online'
    }
  ]

  // Mock data for participants
  const participants: Participant[] = [
    {
      id: 'P001',
      employeeId: 'EMP001',
      employeeName: 'Ahmed Al Mansoori',
      department: 'Engineering',
      program: 'Advanced Excel for Business',
      enrolledDate: '2024-11-10',
      progress: 75,
      status: 'In Progress'
    },
    {
      id: 'P002',
      employeeId: 'EMP002',
      employeeName: 'Fatima Hassan',
      department: 'Sales',
      program: 'Customer Service Excellence',
      enrolledDate: '2024-10-12',
      progress: 100,
      status: 'Completed',
      completionDate: '2024-10-22'
    },
    {
      id: 'P003',
      employeeId: 'EMP003',
      employeeName: 'Mohammed Khan',
      department: 'Marketing',
      program: 'Leadership & Management Skills',
      enrolledDate: '2024-11-20',
      progress: 0,
      status: 'Enrolled'
    },
    {
      id: 'P004',
      employeeId: 'EMP004',
      employeeName: 'Aisha Abdullah',
      department: 'HR',
      program: 'India Labor Law Compliance',
      enrolledDate: '2024-11-18',
      progress: 40,
      status: 'In Progress'
    },
    {
      id: 'P005',
      employeeId: 'EMP005',
      employeeName: 'Omar Rashid',
      department: 'Finance',
      program: 'Digital Marketing Fundamentals',
      enrolledDate: '2024-12-01',
      progress: 0,
      status: 'Dropped'
    }
  ]

  const stats = [
    { label: 'Active Programs', value: '18', change: '+3', icon: BookOpen, color: 'blue' },
    { label: 'Total Participants', value: '245', change: '+45', icon: Users, color: 'purple' },
    { label: 'Completion Rate', value: '87%', change: '+5%', icon: Award, color: 'green' },
    { label: 'Avg. Progress', value: '68%', change: '+12%', icon: TrendingUp, color: 'amber' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-700'
      case 'In Progress': return 'bg-amber-100 text-amber-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      case 'Enrolled': return 'bg-purple-100 text-purple-700'
      case 'Dropped': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Online': return 'bg-blue-100 text-blue-700'
      case 'In-person': return 'bg-green-100 text-green-700'
      case 'Hybrid': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || program.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || participant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training & Development</h1>
          <p className="text-gray-600 mt-1">Manage training programs and track employee development</p>
        </div>
        <button
          onClick={() => toast({ title: 'Opening new training program form...' })}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create Program
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'programs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Training Programs
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'participants'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Participants
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'programs' ? 'Search programs...' : 'Search participants...'}
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
              {activeTab === 'programs' ? (
                <>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="Enrolled">Enrolled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Dropped">Dropped</option>
                </>
              )}
            </select>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'programs' ? (
            <div className="space-y-4">
              {filteredPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                          {program.status}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getModeColor(program.mode)}`}>
                          {program.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {program.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {program.instructor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {program.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {program.startDate} to {program.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast({ title: `Viewing details for ${program.title}` })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toast({ title: `Editing ${program.title}` })}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${program.title}?`)) {
                            toast({ title: 'Training program deleted' })
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-semibold text-gray-900">{program.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{program.enrolled}/{program.capacity}</div>
                        <div className="text-xs text-gray-500">Enrollment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{program.completed}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {program.enrolled > 0 ? Math.round((program.completed / program.enrolled) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPrograms.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
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
                      Program
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Enrolled Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{participant.employeeName}</div>
                          <div className="text-sm text-gray-500">{participant.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">{participant.program}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.enrolledDate}</div>
                        {participant.completionDate && (
                          <div className="text-xs text-green-600">Completed: {participant.completionDate}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className={`h-2 rounded-full ${
                                participant.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${participant.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{participant.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}>
                          {participant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast({ title: `Viewing progress for ${participant.employeeName}` })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast({ title: `Managing ${participant.employeeName}'s training` })}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredParticipants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No participants found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Training Categories */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Technical', 'Management', 'Soft Skills', 'Compliance', 'Sales', 'Marketing', 'Safety', 'Leadership'].map((category) => (
            <div key={category} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">{category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
