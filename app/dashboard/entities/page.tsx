"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Download,
  X
} from 'lucide-react'
import { useCountry } from '@/lib/context/CountryContext'

// Demo entities data
const entities = [
  {
    id: '1',
    name: 'GMP Trading LLC',
    country: 'UAE',
    establishmentNo: 'EST-2345678',
    laborCardNo: 'LC-2345678-01',
    wpsRegistrationNo: 'WPS-AE-12345',
    licenseNo: 'TL-234567',
    // India fields
    pan: '',
    tan: '',
    gstin: '',
    pfRegistrationNo: '',
    esiRegistrationNo: '',
    ptRegistrationNo: '',
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
    country: 'UAE',
    establishmentNo: 'EST-3456789',
    laborCardNo: 'LC-3456789-01',
    wpsRegistrationNo: 'WPS-AE-23456',
    licenseNo: 'FZ-345678',
    // India fields
    pan: '',
    tan: '',
    gstin: '',
    pfRegistrationNo: '',
    esiRegistrationNo: '',
    ptRegistrationNo: '',
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
  {
    id: '3',
    name: 'GMP Technologies India Pvt Ltd',
    country: 'INDIA',
    // UAE fields
    establishmentNo: '',
    laborCardNo: '',
    wpsRegistrationNo: '',
    licenseNo: '',
    // India fields
    pan: 'ABCDE1234F',
    tan: 'DELE12345A',
    gstin: '27ABCDE1234F1Z5',
    pfRegistrationNo: 'DLCPM1234567000',
    esiRegistrationNo: '31001234560000999',
    ptRegistrationNo: 'PT-MH-12345678',
    status: 'active',
    employees: 28,
    monthlyPayroll: 1890000,
    location: 'Maharashtra',
    address: 'Bandra Kurla Complex, Mumbai, Maharashtra, India',
    registrationDate: '2019-08-10',
    contactPerson: 'Rajesh Kumar',
    contactEmail: 'rajesh@gmptech.in',
    contactPhone: '+91 22 1234 5678',
  },
]

type Entity = typeof entities[0]

const emptyEntity = {
  id: '',
  name: '',
  country: '',
  // UAE fields
  establishmentNo: '',
  laborCardNo: '',
  wpsRegistrationNo: '',
  licenseNo: '',
  // India fields
  pan: '',
  tan: '',
  gstin: '',
  pfRegistrationNo: '',
  esiRegistrationNo: '',
  ptRegistrationNo: '',
  status: 'active',
  employees: 0,
  monthlyPayroll: 0,
  location: '',
  address: '',
  registrationDate: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
}

export default function EntitiesPage() {
  const { country } = useCountry()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [viewingEntity, setViewingEntity] = useState<Entity | null>(null)
  const [formData, setFormData] = useState(emptyEntity)

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.establishmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddEntity = () => {
    setEditingEntity(null)
    setFormData({ ...emptyEntity, country: country || 'UAE' })
    setIsModalOpen(true)
  }

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity)
    setFormData(entity)
    setIsModalOpen(true)
  }

  const handleViewEntity = (entity: Entity) => {
    setViewingEntity(entity)
    setIsViewModalOpen(true)
  }

  const handleSubmit = () => {
    // In a real app, this would save to the database
    console.log('Saving entity:', formData)
    setIsModalOpen(false)
    setFormData(emptyEntity)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Entities</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization&apos;s business entities and establishments
          </p>
        </div>
        <Button size="lg" onClick={handleAddEntity}>
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
              {/* Registration Details - Country Specific */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {entity.country === 'INDIA' ? '🇮🇳 India Compliance' : '🇦🇪 UAE Compliance'}
                  </span>
                </div>

                {entity.country === 'INDIA' ? (
                  // India Compliance Display
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">PAN</p>
                        <p className="font-medium text-gray-900">{entity.pan || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">TAN</p>
                        <p className="font-medium text-gray-900">{entity.tan || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">GSTIN</p>
                        <p className="font-medium text-gray-900">{entity.gstin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PF Registration</p>
                        <p className="font-medium text-gray-900">{entity.pfRegistrationNo || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ESI Registration</p>
                        <p className="font-medium text-gray-900">{entity.esiRegistrationNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PT Registration</p>
                        <p className="font-medium text-gray-900">{entity.ptRegistrationNo || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  // UAE Compliance Display
                  <>
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
                  </>
                )}
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
                    {entity.country === 'INDIA'
                      ? `₹${(entity.monthlyPayroll / 1000).toFixed(0)}K`
                      : `AED ${(entity.monthlyPayroll / 1000).toFixed(0)}K`
                    }
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
                  <p className="text-xs text-green-700">
                    {entity.country === 'INDIA'
                      ? 'PF registered • ESI registered • GST compliant • All documents up to date'
                      : 'WPS registered • Labor card valid • All documents up to date'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleViewEntity(entity)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleEditEntity(entity)}>
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

      {/* Add/Edit Entity Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntity ? 'Edit Entity' : 'Add New Entity'}</DialogTitle>
            <DialogDescription>
              {editingEntity ? 'Update the entity details below' : 'Enter the details for the new business entity'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Entity Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={formData.country === 'INDIA' ? 'e.g., GMP Technologies India Pvt Ltd' : 'e.g., GMP Trading LLC'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{formData.country === 'INDIA' ? 'State' : 'Emirate'} *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={formData.country === 'INDIA' ? 'Select state' : 'Select emirate'} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.country === 'INDIA' ? (
                        <>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="Gujarat">Gujarat</SelectItem>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="Telangana">Telangana</SelectItem>
                          <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                          <SelectItem value="Haryana">Haryana</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Dubai">Dubai</SelectItem>
                          <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                          <SelectItem value="Sharjah">Sharjah</SelectItem>
                          <SelectItem value="Ajman">Ajman</SelectItem>
                          <SelectItem value="RAK">Ras Al Khaimah</SelectItem>
                          <SelectItem value="Fujairah">Fujairah</SelectItem>
                          <SelectItem value="UAQ">Umm Al Quwain</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={formData.country === 'INDIA' ? 'e.g., Bandra Kurla Complex, Mumbai, Maharashtra, India' : 'e.g., Business Bay, Dubai, UAE'}
                />
              </div>
            </div>

            {/* Registration Details - Country Specific */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                {formData.country === 'INDIA' ? '🇮🇳 India' : '🇦🇪 UAE'} Compliance & Registration
              </h3>

              {formData.country === 'INDIA' ? (
                // India Compliance Fields
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN (Permanent Account Number) *</Label>
                    <Input
                      id="pan"
                      value={formData.pan}
                      onChange={(e) => handleInputChange('pan', e.target.value)}
                      placeholder="e.g., ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tan">TAN (Tax Deduction Account Number) *</Label>
                    <Input
                      id="tan"
                      value={formData.tan}
                      onChange={(e) => handleInputChange('tan', e.target.value)}
                      placeholder="e.g., DELE12345A"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN (GST Identification Number) *</Label>
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={(e) => handleInputChange('gstin', e.target.value)}
                      placeholder="e.g., 27ABCDE1234F1Z5"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pfRegistrationNo">PF Registration Number *</Label>
                    <Input
                      id="pfRegistrationNo"
                      value={formData.pfRegistrationNo}
                      onChange={(e) => handleInputChange('pfRegistrationNo', e.target.value)}
                      placeholder="e.g., DLCPM1234567000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="esiRegistrationNo">ESI Registration Number</Label>
                    <Input
                      id="esiRegistrationNo"
                      value={formData.esiRegistrationNo}
                      onChange={(e) => handleInputChange('esiRegistrationNo', e.target.value)}
                      placeholder="e.g., 31001234560000999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ptRegistrationNo">PT Registration Number</Label>
                    <Input
                      id="ptRegistrationNo"
                      value={formData.ptRegistrationNo}
                      onChange={(e) => handleInputChange('ptRegistrationNo', e.target.value)}
                      placeholder="e.g., PT-MH-12345678"
                    />
                  </div>
                </div>
              ) : (
                // UAE Compliance Fields
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishmentNo">Establishment Number *</Label>
                    <Input
                      id="establishmentNo"
                      value={formData.establishmentNo}
                      onChange={(e) => handleInputChange('establishmentNo', e.target.value)}
                      placeholder="e.g., EST-2345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laborCardNo">Labor Card Number</Label>
                    <Input
                      id="laborCardNo"
                      value={formData.laborCardNo}
                      onChange={(e) => handleInputChange('laborCardNo', e.target.value)}
                      placeholder="e.g., LC-2345678-01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wpsRegistrationNo">WPS Registration Number *</Label>
                    <Input
                      id="wpsRegistrationNo"
                      value={formData.wpsRegistrationNo}
                      onChange={(e) => handleInputChange('wpsRegistrationNo', e.target.value)}
                      placeholder="e.g., WPS-AE-12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNo">Trade License Number *</Label>
                    <Input
                      id="licenseNo"
                      value={formData.licenseNo}
                      onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                      placeholder="e.g., TL-234567"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="registrationDate">Registration Date</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="e.g., Ahmed Mohammed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder={formData.country === 'INDIA' ? 'e.g., contact@company.in' : 'e.g., contact@company.ae'}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder={formData.country === 'INDIA' ? 'e.g., +91 22 1234 5678' : 'e.g., +971 4 123 4567'}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingEntity ? 'Update Entity' : 'Add Entity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Entity Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              {viewingEntity?.name}
            </DialogTitle>
            <DialogDescription>
              Entity details and compliance information
            </DialogDescription>
          </DialogHeader>

          {viewingEntity && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {viewingEntity.status.charAt(0).toUpperCase() + viewingEntity.status.slice(1)}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {viewingEntity.location}
                </span>
              </div>

              {/* Registration Details - Country Specific */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {viewingEntity.country === 'INDIA' ? '🇮🇳 India' : '🇦🇪 UAE'} Compliance Details
                </h4>

                {viewingEntity.country === 'INDIA' ? (
                  // India Compliance
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">PAN</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.pan || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">TAN</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.tan || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.gstin || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PF Registration</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.pfRegistrationNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ESI Registration</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.esiRegistrationNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PT Registration</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.ptRegistrationNo || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  // UAE Compliance
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Establishment No.</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.establishmentNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Labor Card No.</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.laborCardNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WPS Registration</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.wpsRegistrationNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License No.</p>
                      <p className="font-semibold text-gray-900">{viewingEntity.licenseNo}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{viewingEntity.employees}</p>
                  <p className="text-sm text-gray-500">Employees</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {viewingEntity.country === 'INDIA'
                      ? `₹${viewingEntity.monthlyPayroll.toLocaleString()}`
                      : `AED ${viewingEntity.monthlyPayroll.toLocaleString()}`
                    }
                  </p>
                  <p className="text-sm text-gray-500">Monthly Payroll</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-900">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Contact Person</p>
                    <p className="font-medium">{viewingEntity.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{viewingEntity.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{viewingEntity.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">{viewingEntity.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false)
              if (viewingEntity) handleEditEntity(viewingEntity)
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
