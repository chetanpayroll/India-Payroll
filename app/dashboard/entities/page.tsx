"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Settings,
  Download
} from 'lucide-react'

// Demo entities data
const entities = [
  {
    id: '1',
    name: 'GMP Trading LLC',
    establishmentNo: 'EST-2345678',
    laborCardNo: 'LC-2345678-01',
    wpsRegistrationNo: 'WPS-AE-12345',
    licenseNo: 'TL-234567',
    status: 'active',
    employees: 32,
    monthlyPayroll: 156780,
    location: 'Dubai',
    address: 'Business Bay, Dubai, UAE',
    registrationDate: '2020-03-15',
    contactPerson: 'Ahmed Mohammed',
    contactEmail: 'ahmed@gmptrading.ae',
    contactPhone: '+971 4 123 4567',
  },
  {
    id: '2',
    name: 'GMP Services FZE',
    establishmentNo: 'EST-3456789',
    laborCardNo: 'LC-3456789-01',
    wpsRegistrationNo: 'WPS-AE-23456',
    licenseNo: 'FZ-345678',
    status: 'active',
    employees: 16,
    monthlyPayroll: 88900,
    location: 'Sharjah',
    address: 'Sharjah Airport Free Zone, Sharjah, UAE',
    registrationDate: '2021-06-20',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah@gmpservices.ae',
    contactPhone: '+971 6 234 5678',
  },
]

export default function EntitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.establishmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Entities</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization's business entities and establishments
          </p>
        </div>
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entities</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{entities.length}</p>
                <p className="mt-2 text-sm text-green-600">All active</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {entities.reduce((sum, e) => sum + e.employees, 0)}
                </p>
                <p className="mt-2 text-sm text-gray-500">Across all entities</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  AED {entities.reduce((sum, e) => sum + e.monthlyPayroll, 0).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-gray-500">Combined</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WPS Compliant</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {entities.filter(e => e.wpsRegistrationNo).length}/{entities.length}
                </p>
                <p className="mt-2 text-sm text-green-600">100% compliant</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search entities by name or establishment number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredEntities.map((entity) => (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{entity.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entity.location}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {entity.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Registration Details */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Establishment No.</p>
                    <p className="font-medium text-gray-900">{entity.establishmentNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Labor Card No.</p>
                    <p className="font-medium text-gray-900">{entity.laborCardNo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">WPS Registration</p>
                    <p className="font-medium text-gray-900">{entity.wpsRegistrationNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License No.</p>
                    <p className="font-medium text-gray-900">{entity.licenseNo}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{entity.employees}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Monthly Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">
                    AED {(entity.monthlyPayroll / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Contact Information</h4>
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="text-sm font-medium text-gray-900">{entity.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{entity.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{entity.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{entity.address}</p>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Fully Compliant</p>
                  <p className="text-xs text-green-700">WPS registered • Labor card valid • All documents up to date</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Multi-Entity Management</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Process payroll, generate reports, and manage compliance across all entities
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-300 hover:bg-blue-100">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Bulk Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
