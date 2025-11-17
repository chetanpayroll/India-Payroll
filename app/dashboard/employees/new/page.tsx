"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  DollarSign,
  CreditCard,
  FileText,
  Upload,
  X,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const steps = [
  { id: 1, name: 'Personal Information', icon: User },
  { id: 2, name: 'Employment Details', icon: Briefcase },
  { id: 3, name: 'Salary Structure', icon: DollarSign },
  { id: 4, name: 'Bank Details', icon: CreditCard },
  { id: 5, name: 'Documents', icon: FileText },
]

export default function NewEmployeePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    nationality: 'UAE',
    emiratesIdNo: '',
    passportNo: '',
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    email: '',
    phone: '',
    address: '',
    
    // Employment Details
    employeeNumber: '',
    entity: '',
    designation: '',
    department: '',
    reportingTo: '',
    joinDate: '',
    contractType: 'UNLIMITED',
    probationPeriod: '6',
    
    // Salary Structure
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    foodAllowance: '',
    otherAllowances: '',
    
    // Bank Details
    bankName: '',
    iban: '',
    bankAccountNo: '',
    swiftCode: '',
    
    // GPSSA (for UAE Nationals)
    isEmirati: false,
    gpssaNumber: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    toast({
      title: "Employee Added Successfully!",
      description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
    })
    setTimeout(() => {
      router.push('/dashboard/employees')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/employees')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
            <p className="mt-2 text-gray-600">
              Complete the form to add a new employee to your organization
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium text-center ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {steps.find(s => s.id === currentStep)?.name}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Enter employee\'s personal information and contact details'}
            {currentStep === 2 && 'Provide employment details and contract information'}
            {currentStep === 3 && 'Define salary structure and allowances'}
            {currentStep === 4 && 'Enter bank account details for salary transfer'}
            {currentStep === 5 && 'Upload required documents and identification'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <select
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="UAE">United Arab Emirates</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Philippines">Philippines</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emiratesIdNo">Emirates ID Number</Label>
                  <Input
                    id="emiratesIdNo"
                    name="emiratesIdNo"
                    placeholder="784-XXXX-XXXXXXX-X"
                    value={formData.emiratesIdNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="passportNo">Passport Number *</Label>
                  <Input
                    id="passportNo"
                    name="passportNo"
                    value={formData.passportNo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+971 XX XXX XXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Residential Address *</Label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isEmirati"
                  name="isEmirati"
                  checked={formData.isEmirati}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="isEmirati" className="cursor-pointer">
                  This employee is a UAE National (GPSSA applicable)
                </Label>
              </div>

              {formData.isEmirati && (
                <div>
                  <Label htmlFor="gpssaNumber">GPSSA Number</Label>
                  <Input
                    id="gpssaNumber"
                    name="gpssaNumber"
                    value={formData.gpssaNumber}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Employment Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="employeeNumber">Employee Number *</Label>
                  <Input
                    id="employeeNumber"
                    name="employeeNumber"
                    placeholder="EMP001"
                    value={formData.employeeNumber}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated if left empty</p>
                </div>
                <div>
                  <Label htmlFor="entity">Business Entity *</Label>
                  <select
                    id="entity"
                    name="entity"
                    value={formData.entity}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Entity</option>
                    <option value="gmp-trading">GMP Trading LLC</option>
                    <option value="gmp-services">GMP Services FZE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="designation">Job Title / Designation *</Label>
                  <Input
                    id="designation"
                    name="designation"
                    placeholder="e.g., Senior Accountant"
                    value={formData.designation}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Department</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">Human Resources</option>
                    <option value="IT">Information Technology</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reportingTo">Reporting To</Label>
                  <select
                    id="reportingTo"
                    name="reportingTo"
                    value={formData.reportingTo}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Manager</option>
                    <option value="ahmed">Ahmed Mohammed - CEO</option>
                    <option value="sarah">Sarah Johnson - HR Manager</option>
                    <option value="fatima">Fatima Ali - Finance Manager</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="joinDate">Joining Date *</Label>
                  <Input
                    id="joinDate"
                    name="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contractType">Contract Type *</Label>
                  <select
                    id="contractType"
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="UNLIMITED">Unlimited Contract</option>
                    <option value="LIMITED">Limited Contract (2 years)</option>
                    <option value="PART_TIME">Part-Time Contract</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="probationPeriod">Probation Period (months)</Label>
                  <Input
                    id="probationPeriod"
                    name="probationPeriod"
                    type="number"
                    min="0"
                    max="6"
                    value={formData.probationPeriod}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Salary Structure */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">UAE Salary Structure</h4>
                <p className="text-sm text-blue-700">
                  Define the employee's monthly salary breakdown including basic salary and allowances
                </p>
              </div>

              <div>
                <Label htmlFor="basicSalary">Basic Salary (AED) *</Label>
                <Input
                  id="basicSalary"
                  name="basicSalary"
                  type="number"
                  placeholder="0.00"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Basic salary is used for end-of-service calculations and GPSSA
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="housingAllowance">Housing Allowance (AED)</Label>
                  <Input
                    id="housingAllowance"
                    name="housingAllowance"
                    type="number"
                    placeholder="0.00"
                    value={formData.housingAllowance}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="transportAllowance">Transport Allowance (AED)</Label>
                  <Input
                    id="transportAllowance"
                    name="transportAllowance"
                    type="number"
                    placeholder="0.00"
                    value={formData.transportAllowance}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="foodAllowance">Food Allowance (AED)</Label>
                  <Input
                    id="foodAllowance"
                    name="foodAllowance"
                    type="number"
                    placeholder="0.00"
                    value={formData.foodAllowance}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="otherAllowances">Other Allowances (AED)</Label>
                  <Input
                    id="otherAllowances"
                    name="otherAllowances"
                    type="number"
                    placeholder="0.00"
                    value={formData.otherAllowances}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Total Monthly Salary</span>
                  <span className="text-2xl font-bold text-gray-900">
                    AED {(
                      parseFloat(formData.basicSalary || '0') +
                      parseFloat(formData.housingAllowance || '0') +
                      parseFloat(formData.transportAllowance || '0') +
                      parseFloat(formData.foodAllowance || '0') +
                      parseFloat(formData.otherAllowances || '0')
                    ).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Gross salary before deductions
                </p>
              </div>

              {formData.isEmirati && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">GPSSA Contribution</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Employee Share (5%)</span>
                      <span className="font-medium text-green-900">
                        AED {(parseFloat(formData.basicSalary || '0') * 0.05).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Employer Share (12.5%)</span>
                      <span className="font-medium text-green-900">
                        AED {(parseFloat(formData.basicSalary || '0') * 0.125).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Bank Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Bank Account Information</h4>
                <p className="text-sm text-blue-700">
                  Required for WPS (Wage Protection System) compliance and salary transfers
                </p>
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <select
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Bank</option>
                  <option value="Emirates NBD">Emirates NBD</option>
                  <option value="First Abu Dhabi Bank">First Abu Dhabi Bank (FAB)</option>
                  <option value="Dubai Islamic Bank">Dubai Islamic Bank</option>
                  <option value="Abu Dhabi Commercial Bank">Abu Dhabi Commercial Bank (ADCB)</option>
                  <option value="Mashreq Bank">Mashreq Bank</option>
                  <option value="Commercial Bank of Dubai">Commercial Bank of Dubai</option>
                  <option value="RAKBANK">RAKBANK</option>
                  <option value="Sharjah Islamic Bank">Sharjah Islamic Bank</option>
                </select>
              </div>

              <div>
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  name="iban"
                  placeholder="AE07 0331 2345 6789 0123 456"
                  value={formData.iban}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  23-character IBAN starting with AE
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bankAccountNo">Bank Account Number</Label>
                  <Input
                    id="bankAccountNo"
                    name="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                  <Input
                    id="swiftCode"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Important
                </h4>
                <p className="text-sm text-yellow-800">
                  Bank details must be verified before first salary payment. WPS registration requires accurate IBAN.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Required Documents</h4>
                <p className="text-sm text-blue-700">
                  Upload copies of identification and employment documents
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'emirates-id', name: 'Emirates ID (Both Sides)', required: true },
                  { id: 'passport', name: 'Passport Copy', required: true },
                  { id: 'visa', name: 'UAE Visa / Residence Permit', required: true },
                  { id: 'contract', name: 'Employment Contract', required: true },
                  { id: 'certificate', name: 'Educational Certificates', required: false },
                  { id: 'experience', name: 'Experience Letters', required: false },
                ].map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {doc.name}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG (MAX. 5MB)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/employees')}
              >
                Cancel
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
