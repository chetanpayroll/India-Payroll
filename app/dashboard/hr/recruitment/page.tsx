'use client'

import { useState } from 'react'
import { Search, Filter, Plus, Users, Briefcase, FileText, CheckCircle, Eye, Edit, Trash2, Calendar, MapPin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract'
  status: 'Open' | 'Closed' | 'On Hold'
  postedDate: string
  applications: number
  interviewed: number
  hired: number
  salary: string
  description: string
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Hired'
  appliedDate: string
  experience: string
  rating: number
}

export default function RecruitmentPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Mock data for jobs
  const jobs: Job[] = [
    {
      id: 'J001',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Bangalore, India',
      type: 'Full-time',
      status: 'Open',
      postedDate: '2024-11-01',
      applications: 45,
      interviewed: 12,
      hired: 0,
      salary: '₹1,20,000 - 1,50,000',
      description: 'Looking for an experienced software engineer with 5+ years experience'
    },
    {
      id: 'J002',
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Mumbai, India',
      type: 'Full-time',
      status: 'Open',
      postedDate: '2024-11-10',
      applications: 28,
      interviewed: 8,
      hired: 0,
      salary: '₹90,000 - 1,20,000',
      description: 'Experienced marketing professional to lead our marketing team'
    },
    {
      id: 'J003',
      title: 'HR Specialist',
      department: 'Human Resources',
      location: 'Pune, India',
      type: 'Full-time',
      status: 'Closed',
      postedDate: '2024-10-15',
      applications: 67,
      interviewed: 15,
      hired: 1,
      salary: '₹60,000 - 80,000',
      description: 'HR professional with 3+ years experience in recruitment and employee relations'
    },
    {
      id: 'J004',
      title: 'Sales Executive',
      department: 'Sales',
      location: 'Delhi, India',
      type: 'Full-time',
      status: 'On Hold',
      postedDate: '2024-11-05',
      applications: 32,
      interviewed: 5,
      hired: 0,
      salary: '₹45,000 + Commission',
      description: 'Dynamic sales professional to join our growing sales team'
    }
  ]

  // Mock data for candidates
  const candidates: Candidate[] = [
    {
      id: 'C001',
      name: 'Ahmed Al Mansoori',
      email: 'ahmed.m@email.com',
      phone: '+971 50 123 4567',
      position: 'Senior Software Engineer',
      stage: 'Interview',
      appliedDate: '2024-11-05',
      experience: '7 years',
      rating: 4.5
    },
    {
      id: 'C002',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+971 55 234 5678',
      position: 'Marketing Manager',
      stage: 'Offer',
      appliedDate: '2024-11-12',
      experience: '5 years',
      rating: 4.8
    },
    {
      id: 'C003',
      name: 'Mohammed Khan',
      email: 'mohammed.k@email.com',
      phone: '+971 50 345 6789',
      position: 'Senior Software Engineer',
      stage: 'Screening',
      appliedDate: '2024-11-15',
      experience: '6 years',
      rating: 4.2
    },
    {
      id: 'C004',
      name: 'Fatima Hassan',
      email: 'fatima.h@email.com',
      phone: '+971 55 456 7890',
      position: 'HR Specialist',
      stage: 'Hired',
      appliedDate: '2024-10-20',
      experience: '4 years',
      rating: 4.9
    },
    {
      id: 'C005',
      name: 'John Smith',
      email: 'john.s@email.com',
      phone: '+971 50 567 8901',
      position: 'Sales Executive',
      stage: 'Rejected',
      appliedDate: '2024-11-08',
      experience: '2 years',
      rating: 3.5
    }
  ]

  const stats = [
    { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'blue' },
    { label: 'Total Applications', value: '248', icon: FileText, color: 'purple' },
    { label: 'Interviews Scheduled', value: '34', icon: Users, color: 'amber' },
    { label: 'Offers Made', value: '8', icon: CheckCircle, color: 'green' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-700'
      case 'Closed': return 'bg-gray-100 text-gray-700'
      case 'On Hold': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Applied': return 'bg-blue-100 text-blue-700'
      case 'Screening': return 'bg-purple-100 text-purple-700'
      case 'Interview': return 'bg-amber-100 text-amber-700'
      case 'Offer': return 'bg-green-100 text-green-700'
      case 'Hired': return 'bg-emerald-100 text-emerald-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || candidate.stage === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600 mt-1">Manage job postings and track candidates</p>
        </div>
        <button
          onClick={() => toast({ title: 'Opening new job posting form...' })}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Post New Job
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'jobs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'candidates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Candidates
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
                  placeholder={activeTab === 'jobs' ? 'Search jobs...' : 'Search candidates...'}
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
              {activeTab === 'jobs' ? (
                <>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="On Hold">On Hold</option>
                </>
              ) : (
                <>
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
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
          {activeTab === 'jobs' ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted: {job.postedDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast({ title: `Viewing details for ${job.title}` })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toast({ title: `Editing ${job.title}` })}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${job.title}?`)) {
                            toast({ title: 'Job posting deleted' })
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{job.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Salary:</span>
                        <span className="ml-2 font-semibold text-gray-900">{job.salary}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-semibold text-gray-900">{job.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{job.applications}</div>
                        <div className="text-xs text-gray-500">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{job.interviewed}</div>
                        <div className="text-xs text-gray-500">Interviewed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{job.hired}</div>
                        <div className="text-xs text-gray-500">Hired</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
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
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                          <div className="text-xs text-gray-400">{candidate.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.appliedDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.experience}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                          {candidate.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{candidate.rating}/5.0</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast({ title: `Viewing profile for ${candidate.name}` })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast({ title: `Editing ${candidate.name}'s application` })}
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

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
