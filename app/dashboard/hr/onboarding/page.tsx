'use client'

import { useState } from 'react'
import { Search, Filter, Plus, UserPlus, CheckCircle, Clock, AlertCircle, Eye, Edit, Calendar, Briefcase } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface OnboardingTask {
  id: string
  title: string
  description: string
  category: 'Documentation' | 'Equipment' | 'Training' | 'IT Setup' | 'HR Orientation' | 'Team Introduction'
  completed: boolean
  dueDate?: string
}

interface Onboarding {
  id: string
  employeeId: string
  employeeName: string
  position: string
  department: string
  joinDate: string
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed'
  progress: number
  totalTasks: number
  completedTasks: number
  assignedTo: string
  startDate: string
  expectedCompletion: string
}

export default function OnboardingPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOnboarding, setSelectedOnboarding] = useState<string | null>(null)

  // Mock data for onboarding processes
  const onboardings: Onboarding[] = [
    {
      id: 'ON001',
      employeeId: 'EMP101',
      employeeName: 'Khalid Al Shamsi',
      position: 'Software Engineer',
      department: 'Engineering',
      joinDate: '2024-12-01',
      status: 'In Progress',
      progress: 65,
      totalTasks: 15,
      completedTasks: 10,
      assignedTo: 'Sarah Johnson',
      startDate: '2024-11-25',
      expectedCompletion: '2024-12-15'
    },
    {
      id: 'ON002',
      employeeId: 'EMP102',
      employeeName: 'Mariam Abdullah',
      position: 'Marketing Manager',
      department: 'Marketing',
      joinDate: '2024-12-05',
      status: 'Not Started',
      progress: 0,
      totalTasks: 12,
      completedTasks: 0,
      assignedTo: 'John Smith',
      startDate: '2024-12-01',
      expectedCompletion: '2024-12-20'
    },
    {
      id: 'ON003',
      employeeId: 'EMP103',
      employeeName: 'Ahmed Hassan',
      position: 'Sales Executive',
      department: 'Sales',
      joinDate: '2024-11-15',
      status: 'Completed',
      progress: 100,
      totalTasks: 14,
      completedTasks: 14,
      assignedTo: 'Michael Brown',
      startDate: '2024-11-10',
      expectedCompletion: '2024-11-25'
    },
    {
      id: 'ON004',
      employeeId: 'EMP104',
      employeeName: 'Layla Mohammed',
      position: 'HR Specialist',
      department: 'Human Resources',
      joinDate: '2024-11-20',
      status: 'In Progress',
      progress: 85,
      totalTasks: 13,
      completedTasks: 11,
      assignedTo: 'Sarah Johnson',
      startDate: '2024-11-15',
      expectedCompletion: '2024-12-05'
    },
    {
      id: 'ON005',
      employeeId: 'EMP105',
      employeeName: 'Omar Rashid',
      position: 'Accountant',
      department: 'Finance',
      joinDate: '2024-11-10',
      status: 'Delayed',
      progress: 40,
      totalTasks: 15,
      completedTasks: 6,
      assignedTo: 'Emily Davis',
      startDate: '2024-11-05',
      expectedCompletion: '2024-11-20'
    }
  ]

  // Mock onboarding tasks template
  const taskTemplate: OnboardingTask[] = [
    { id: 'T01', title: 'Submit Required Documents', description: 'Emirates ID, Passport, Visa copies', category: 'Documentation', completed: true },
    { id: 'T02', title: 'Sign Employment Contract', description: 'Review and sign official employment contract', category: 'Documentation', completed: true },
    { id: 'T03', title: 'Complete Employee Information Form', description: 'Fill out personal and emergency contact details', category: 'Documentation', completed: true },
    { id: 'T04', title: 'Setup Email Account', description: 'IT to create company email and login credentials', category: 'IT Setup', completed: true },
    { id: 'T05', title: 'Assign Laptop and Phone', description: 'Provide laptop, phone, and necessary accessories', category: 'Equipment', completed: true },
    { id: 'T06', title: 'Setup VPN and System Access', description: 'Configure VPN, project management tools, and software', category: 'IT Setup', completed: true },
    { id: 'T07', title: 'Company Orientation Session', description: 'Introduction to company culture, values, and policies', category: 'HR Orientation', completed: true },
    { id: 'T08', title: 'HR Policies Briefing', description: 'Review leave policy, code of conduct, benefits', category: 'HR Orientation', completed: true },
    { id: 'T09', title: 'Safety and Security Training', description: 'Office safety procedures and emergency protocols', category: 'Training', completed: true },
    { id: 'T10', title: 'Meet Team Members', description: 'Introduction to immediate team and manager', category: 'Team Introduction', completed: true },
    { id: 'T11', title: 'Department Overview', description: 'Understanding department goals and responsibilities', category: 'Training', completed: false, dueDate: '2024-12-08' },
    { id: 'T12', title: 'Role-Specific Training', description: 'Training on job-specific tools and processes', category: 'Training', completed: false, dueDate: '2024-12-10' },
    { id: 'T13', title: 'Setup Direct Deposit', description: 'Provide bank details for salary transfer', category: 'Documentation', completed: false, dueDate: '2024-12-05' },
    { id: 'T14', title: '30-Day Check-in Meeting', description: 'Review progress and address any concerns', category: 'HR Orientation', completed: false, dueDate: '2024-12-15' },
    { id: 'T15', title: 'Complete Onboarding Feedback', description: 'Survey about onboarding experience', category: 'HR Orientation', completed: false, dueDate: '2024-12-15' }
  ]

  const stats = [
    { label: 'Active Onboarding', value: '8', icon: UserPlus, color: 'blue' },
    { label: 'Completed', value: '45', icon: CheckCircle, color: 'green' },
    { label: 'In Progress', value: '5', icon: Clock, color: 'amber' },
    { label: 'Delayed', value: '2', icon: AlertCircle, color: 'red' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Delayed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Documentation': return 'bg-blue-100 text-blue-700'
      case 'Equipment': return 'bg-green-100 text-green-700'
      case 'Training': return 'bg-purple-100 text-purple-700'
      case 'IT Setup': return 'bg-amber-100 text-amber-700'
      case 'HR Orientation': return 'bg-pink-100 text-pink-700'
      case 'Team Introduction': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOnboardings = onboardings.filter(onboarding => {
    const matchesSearch = onboarding.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         onboarding.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         onboarding.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         onboarding.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || onboarding.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-gray-600 mt-1">Track and manage new employee onboarding processes</p>
        </div>
        <button
          onClick={() => toast({ title: 'Opening new onboarding process...' })}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Onboarding
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
                placeholder="Search by employee name, ID, position, or department..."
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
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            More Filters
          </button>
        </div>
      </div>

      {/* Onboarding List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOnboardings.map((onboarding) => (
                <tr key={onboarding.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{onboarding.employeeName}</div>
                      <div className="text-sm text-gray-500">{onboarding.employeeId}</div>
                      <div className="text-xs text-gray-400">{onboarding.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{onboarding.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {onboarding.joinDate}
                    </div>
                    <div className="text-xs text-gray-500">Due: {onboarding.expectedCompletion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                        <div
                          className={`h-2 rounded-full ${
                            onboarding.progress === 100
                              ? 'bg-green-600'
                              : onboarding.status === 'Delayed'
                              ? 'bg-red-600'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${onboarding.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">{onboarding.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {onboarding.completedTasks}/{onboarding.totalTasks}
                    </div>
                    <div className="text-xs text-gray-500">completed</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(onboarding.status)}`}>
                      {onboarding.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{onboarding.assignedTo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOnboarding(onboarding.id)
                          toast({ title: `Viewing onboarding for ${onboarding.employeeName}` })
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast({ title: `Editing onboarding for ${onboarding.employeeName}` })}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Onboarding"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOnboardings.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No onboarding processes found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Onboarding Checklist Template */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Standard Onboarding Checklist</h3>
            <p className="text-sm text-gray-600 mt-1">Template tasks for new employee onboarding</p>
          </div>
          <button
            onClick={() => toast({ title: 'Customizing checklist template...' })}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Customize
          </button>
        </div>

        <div className="space-y-3">
          {taskTemplate.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="mt-1">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${task.completed ? 'text-green-900' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                </div>
                <p className={`text-sm ${task.completed ? 'text-green-700' : 'text-gray-600'}`}>
                  {task.description}
                </p>
                {task.dueDate && !task.completed && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                    <Clock className="w-3 h-3" />
                    Due: {task.dueDate}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Information */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Best Practices</h3>
            <p className="text-gray-700 mb-4">
              A structured onboarding process helps new employees integrate smoothly and become productive faster.
              Our standard onboarding takes 2-4 weeks depending on the role.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Week 1</div>
                <div className="font-semibold text-gray-900">Documentation & Setup</div>
                <div className="text-xs text-gray-500 mt-1">Complete paperwork, IT setup, orientation</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Week 2-3</div>
                <div className="font-semibold text-gray-900">Training & Integration</div>
                <div className="text-xs text-gray-500 mt-1">Role training, team meetings, shadowing</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Week 4</div>
                <div className="font-semibold text-gray-900">Review & Feedback</div>
                <div className="text-xs text-gray-500 mt-1">30-day check-in, feedback, adjustments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
