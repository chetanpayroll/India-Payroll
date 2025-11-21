'use client';

// ============================================================================
// NEW INDIA EMPLOYEE PAGE
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IndiaValidator } from '@/lib/payroll/engines/india/IndiaValidator';

interface EmployeeFormData {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  dateOfJoining: string;
  department: string;
  designation: string;

  // Statutory IDs
  pan: string;
  aadhaar: string;
  uan: string;
  esicNumber: string;

  // Bank Details
  bankName: string;
  bankAccount: string;
  ifscCode: string;

  // Salary Structure
  basic: string;
  hra: string;
  lta: string;
  specialAllowance: string;
  conveyance: string;
  medicalAllowance: string;

  // Statutory Flags
  pfApplicable: boolean;
  esicApplicable: boolean;
  ptApplicable: boolean;

  // Tax Info
  taxRegime: 'OLD' | 'NEW';

  // Location
  state: string;
  city: string;
  cityType: 'metro' | 'non-metro';

  // Declarations
  section80C: string;
  section80D: string;
}

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  dateOfJoining: '',
  department: '',
  designation: '',
  pan: '',
  aadhaar: '',
  uan: '',
  esicNumber: '',
  bankName: '',
  bankAccount: '',
  ifscCode: '',
  basic: '',
  hra: '',
  lta: '',
  specialAllowance: '',
  conveyance: '',
  medicalAllowance: '',
  pfApplicable: true,
  esicApplicable: false,
  ptApplicable: true,
  taxRegime: 'NEW',
  state: '',
  city: '',
  cityType: 'metro',
  section80C: '',
  section80D: '',
};

const INDIAN_STATES = [
  'ANDHRA_PRADESH', 'ARUNACHAL_PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
  'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL_PRADESH', 'JHARKHAND', 'KARNATAKA',
  'KERALA', 'MADHYA_PRADESH', 'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM',
  'NAGALAND', 'ODISHA', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL_NADU',
  'TELANGANA', 'TRIPURA', 'UTTAR_PRADESH', 'UTTARAKHAND', 'WEST_BENGAL',
  'DELHI', 'JAMMU_AND_KASHMIR', 'LADAKH',
];

const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'Admin'];

export default function NewIndiaEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'statutory' | 'salary' | 'tax'>('personal');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (field: string, value: string) => {
    let result;
    switch (field) {
      case 'pan':
        result = IndiaValidator.validatePAN(value);
        break;
      case 'aadhaar':
        if (value) result = IndiaValidator.validateAadhaar(value);
        break;
      case 'ifscCode':
        result = IndiaValidator.validateIFSC(value);
        break;
      case 'bankAccount':
        result = IndiaValidator.validateBankAccount(value);
        break;
      case 'uan':
        if (value) result = IndiaValidator.validateUAN(value);
        break;
      case 'esicNumber':
        if (value) result = IndiaValidator.validateESICNumber(value);
        break;
    }

    if (result && !result.isValid) {
      setErrors((prev) => ({
        ...prev,
        [field]: result.errors[0]?.message || 'Invalid value',
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.pan) newErrors.pan = 'PAN is required';
    if (!formData.bankAccount) newErrors.bankAccount = 'Bank account is required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (!formData.basic) newErrors.basic = 'Basic salary is required';
    if (!formData.state) newErrors.state = 'State is required';

    // Validate PAN format
    if (formData.pan) {
      const panResult = IndiaValidator.validatePAN(formData.pan);
      if (!panResult.isValid) {
        newErrors.pan = panResult.errors[0]?.message || 'Invalid PAN';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Create employee object
    const employee = {
      id: `IND${Date.now()}`,
      employeeCode: `IND${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      gender: formData.gender,
      dateOfJoining: new Date(formData.dateOfJoining || Date.now()),
      department: formData.department,
      designation: formData.designation,
      status: 'active',
      country: 'INDIA',
      pan: formData.pan.toUpperCase(),
      aadhaar: formData.aadhaar,
      uan: formData.uan,
      esicNumber: formData.esicNumber,
      bankName: formData.bankName,
      bankAccount: formData.bankAccount,
      ifscCode: formData.ifscCode.toUpperCase(),
      salaryStructure: {
        basic: Number(formData.basic) || 0,
        hra: Number(formData.hra) || 0,
        lta: Number(formData.lta) || 0,
        specialAllowance: Number(formData.specialAllowance) || 0,
        conveyance: Number(formData.conveyance) || 0,
        medicalAllowance: Number(formData.medicalAllowance) || 0,
      },
      pfApplicable: formData.pfApplicable,
      esicApplicable: formData.esicApplicable,
      ptApplicable: formData.ptApplicable,
      taxRegime: formData.taxRegime,
      state: formData.state,
      city: formData.city,
      cityType: formData.cityType,
      declarations: {
        section80C: { total: Number(formData.section80C) || 0 },
        section80D: { selfAndFamily: Number(formData.section80D) || 0 },
      },
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('india_employees') || '[]');
    localStorage.setItem('india_employees', JSON.stringify([...existing, employee]));

    // Redirect
    router.push('/dashboard/employees?country=india');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'statutory', label: 'Statutory IDs' },
    { id: 'salary', label: 'Salary Structure' },
    { id: 'tax', label: 'Tax & Declarations' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇮🇳</span>
          <h1 className="text-2xl font-bold text-gray-900">Add India Employee</h1>
        </div>
        <p className="text-gray-600 mt-1">Add a new employee with Indian payroll structure</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Type</label>
                <select
                  name="cityType"
                  value={formData.cityType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="metro">Metro</option>
                  <option value="non-metro">Non-Metro</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Affects HRA exemption calculation</p>
              </div>
            </div>
          </div>
        )}

        {/* Statutory IDs Tab */}
        {activeTab === 'statutory' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Statutory Identifiers</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN *</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ABCDE1234F"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase ${
                    errors.pan ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar</label>
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="XXXX XXXX XXXX"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.aadhaar ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UAN (PF Account)</label>
                <input
                  type="text"
                  name="uan"
                  value={formData.uan}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="100123456789"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.uan ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.uan && <p className="text-red-500 text-sm mt-1">{errors.uan}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ESIC Number</label>
                <input
                  type="text"
                  name="esicNumber"
                  value={formData.esicNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="17-digit ESIC number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.esicNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.esicNumber && <p className="text-red-500 text-sm mt-1">{errors.esicNumber}</p>}
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-md font-semibold text-gray-900">Bank Details</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bankAccount && <p className="text-red-500 text-sm mt-1">{errors.bankAccount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="HDFC0001234"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase ${
                    errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Salary Structure Tab */}
        {activeTab === 'salary' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Salary Structure</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (Monthly) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="basic"
                    value={formData.basic}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.basic ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.basic && <p className="text-red-500 text-sm mt-1">{errors.basic}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HRA (House Rent Allowance)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="hra"
                    value={formData.hra}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LTA (Leave Travel Allowance)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="lta"
                    value={formData.lta}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Allowance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="specialAllowance"
                    value={formData.specialAllowance}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conveyance Allowance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="conveyance"
                    value={formData.conveyance}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Allowance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="medicalAllowance"
                    value={formData.medicalAllowance}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <span className="font-medium">Monthly Gross: </span>
                ₹{(
                  Number(formData.basic || 0) +
                  Number(formData.hra || 0) +
                  Number(formData.lta || 0) +
                  Number(formData.specialAllowance || 0) +
                  Number(formData.conveyance || 0) +
                  Number(formData.medicalAllowance || 0)
                ).toLocaleString('en-IN')}
              </p>
            </div>

            <hr className="my-6" />

            <h3 className="text-md font-semibold text-gray-900">Statutory Applicability</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="pfApplicable"
                  checked={formData.pfApplicable}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700">Provident Fund (PF) Applicable</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="esicApplicable"
                  checked={formData.esicApplicable}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700">ESIC Applicable (for gross ≤ ₹21,000)</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="ptApplicable"
                  checked={formData.ptApplicable}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700">Professional Tax (PT) Applicable</span>
              </label>
            </div>
          </div>
        )}

        {/* Tax & Declarations Tab */}
        {activeTab === 'tax' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Tax Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Regime</label>
              <div className="grid md:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.taxRegime === 'NEW'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="taxRegime"
                    value="NEW"
                    checked={formData.taxRegime === 'NEW'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <p className="font-medium text-gray-900">New Tax Regime</p>
                  <p className="text-sm text-gray-500 mt-1">Lower rates, fewer exemptions</p>
                </label>

                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.taxRegime === 'OLD'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="taxRegime"
                    value="OLD"
                    checked={formData.taxRegime === 'OLD'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <p className="font-medium text-gray-900">Old Tax Regime</p>
                  <p className="text-sm text-gray-500 mt-1">Higher rates, more exemptions</p>
                </label>
              </div>
            </div>

            {formData.taxRegime === 'OLD' && (
              <>
                <hr className="my-6" />
                <h3 className="text-md font-semibold text-gray-900">Tax Declarations (Annual)</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section 80C (Max ₹1,50,000)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="section80C"
                        value={formData.section80C}
                        onChange={handleChange}
                        placeholder="PPF, ELSS, LIC, etc."
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PPF, ELSS, LIC Premium, NSC, etc.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section 80D (Medical Insurance)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="section80D"
                        value={formData.section80D}
                        onChange={handleChange}
                        placeholder="Health insurance premium"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max ₹25,000 (₹50,000 for senior citizens)</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {activeTab !== 'personal' && (
              <button
                type="button"
                onClick={() => {
                  const tabIndex = tabs.findIndex((t) => t.id === activeTab);
                  setActiveTab(tabs[tabIndex - 1].id as typeof activeTab);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}

            {activeTab !== 'tax' ? (
              <button
                type="button"
                onClick={() => {
                  const tabIndex = tabs.findIndex((t) => t.id === activeTab);
                  setActiveTab(tabs[tabIndex + 1].id as typeof activeTab);
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Employee'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
