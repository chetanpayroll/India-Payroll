'use client'

import { useState, useEffect } from 'react'
import { useCountry } from '@/lib/context/CountryContext'
import { useCurrencyFormatter, useCurrencySymbol } from '@/lib/hooks/use-currency-formatter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useToast } from '@/components/ui/use-toast'
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Shield,
  Calendar,
  Settings,
  CheckCircle2,
  XCircle,
  Globe,
  FileText,
  Calculator,
  Zap,
  DollarSign
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface PayrollElement {
  id: string
  name: string
  nameArabic?: string
  code: string
  type: 'EARNING' | 'DEDUCTION'
  category: string
  isRecurring: boolean
  isTaxable: boolean
  calculationMethod: 'FIXED' | 'PERCENTAGE' | 'PRORATED'
  percentageOf?: string
  percentage?: number
  defaultAmount?: number
  description?: string
  countryCode?: string
  isStatutory: boolean
  isSystemDefined: boolean
  isActive: boolean
  displayOrder: number
  showInPayslip: boolean
  rules?: any[]
  complianceMappings?: any[]
  createdAt?: string
  updatedAt?: string
}

const elementCategories = {
  EARNING: [
    'BASIC_SALARY',
    'HOUSING_ALLOWANCE',
    'TRANSPORT_ALLOWANCE',
    'FOOD_ALLOWANCE',
    'OTHER_ALLOWANCE',
    'BONUS',
    'COMMISSION',
    'OVERTIME',
    'INCENTIVE',
    'ARREARS',
    'HRA',
    'LTA',
    'SPECIAL_ALLOWANCE',
    'CONVEYANCE',
    'MEDICAL_ALLOWANCE',
    'EDUCATION_ALLOWANCE',
  ],
  DEDUCTION: [
    'LOAN_DEDUCTION',
    'ADVANCE_DEDUCTION',
    'PENALTY',
    'OTHER_DEDUCTION',
    'GPSSA_EMPLOYEE',
    'GPSSA_EMPLOYER',
    'PF_EMPLOYEE',
    'PF_EMPLOYER',
    'ESIC_EMPLOYEE',
    'ESIC_EMPLOYER',
    'PROFESSIONAL_TAX',
    'TDS',
    'LWF_EMPLOYEE',
    'LWF_EMPLOYER',
  ],
}

export default function PayrollElementsPage() {
  const { country, countryConfig } = useCountry()
  const formatCurrency = useCurrencyFormatter()
  const currencySymbol = useCurrencySymbol()
  const { toast } = useToast()

  // State management
  const [elements, setElements] = useState<PayrollElement[]>([])
  const [filteredElements, setFilteredElements] = useState<PayrollElement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingElement, setEditingElement] = useState<PayrollElement | null>(null)

  // Filter states
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [filterCountry, setFilterCountry] = useState<string>(country || 'ALL')
  const [filterStatutory, setFilterStatutory] = useState<string>('ALL')
  const [filterRecurring, setFilterRecurring] = useState<string>('ALL')

  // Form state
  const [formData, setFormData] = useState<Partial<PayrollElement>>({
    name: '',
    nameArabic: '',
    code: '',
    type: 'EARNING',
    category: 'BASIC_SALARY',
    isRecurring: true,
    isTaxable: true,
    calculationMethod: 'FIXED',
    percentageOf: '',
    percentage: 0,
    defaultAmount: 0,
    description: '',
    countryCode: country || undefined,
    isStatutory: false,
    isSystemDefined: false,
    isActive: true,
    displayOrder: 0,
    showInPayslip: true,
  })

  // Load elements
  useEffect(() => {
    loadElements()
  }, [])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [elements, searchTerm, filterType, filterCategory, filterCountry, filterStatutory, filterRecurring])

  const loadElements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (country) params.set('countryCode', country)

      const response = await fetch(`/api/payroll/elements?${params}`)
      const data = await response.json()

      if (data.success) {
        setElements(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load elements',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading elements:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payroll elements',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...elements]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (el) =>
          el.name.toLowerCase().includes(term) ||
          el.code.toLowerCase().includes(term) ||
          el.description?.toLowerCase().includes(term)
      )
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter((el) => el.type === filterType)
    }

    // Category filter
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter((el) => el.category === filterCategory)
    }

    // Country filter
    if (filterCountry !== 'ALL') {
      filtered = filtered.filter(
        (el) => el.countryCode === filterCountry || el.countryCode === null
      )
    }

    // Statutory filter
    if (filterStatutory !== 'ALL') {
      filtered = filtered.filter((el) => el.isStatutory === (filterStatutory === 'YES'))
    }

    // Recurring filter
    if (filterRecurring !== 'ALL') {
      filtered = filtered.filter((el) => el.isRecurring === (filterRecurring === 'YES'))
    }

    setFilteredElements(filtered)
  }

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name || !formData.code || !formData.type || !formData.category) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        })
        return
      }

      const url = editingElement
        ? `/api/payroll/elements/${editingElement.id}`
        : '/api/payroll/elements'

      const method = editingElement ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Element saved successfully',
        })
        setShowModal(false)
        setEditingElement(null)
        resetForm()
        loadElements()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save element',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving element:', error)
      toast({
        title: 'Error',
        description: 'Failed to save element',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (element: PayrollElement) => {
    setEditingElement(element)
    setFormData({
      name: element.name,
      nameArabic: element.nameArabic,
      code: element.code,
      type: element.type,
      category: element.category,
      isRecurring: element.isRecurring,
      isTaxable: element.isTaxable,
      calculationMethod: element.calculationMethod,
      percentageOf: element.percentageOf,
      percentage: element.percentage,
      defaultAmount: element.defaultAmount,
      description: element.description,
      countryCode: element.countryCode,
      isStatutory: element.isStatutory,
      isSystemDefined: element.isSystemDefined,
      isActive: element.isActive,
      displayOrder: element.displayOrder,
      showInPayslip: element.showInPayslip,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string, element: PayrollElement) => {
    if (element.isSystemDefined) {
      toast({
        title: 'Cannot Delete',
        description: 'System-defined elements cannot be deleted',
        variant: 'destructive',
      })
      return
    }

    if (!confirm('Are you sure you want to delete this element?')) {
      return
    }

    try {
      const response = await fetch(`/api/payroll/elements/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Element deleted successfully',
        })
        loadElements()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete element',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting element:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete element',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameArabic: '',
      code: '',
      type: 'EARNING',
      category: 'BASIC_SALARY',
      isRecurring: true,
      isTaxable: true,
      calculationMethod: 'FIXED',
      percentageOf: '',
      percentage: 0,
      defaultAmount: 0,
      description: '',
      countryCode: country || undefined,
      isStatutory: false,
      isSystemDefined: false,
      isActive: true,
      displayOrder: 0,
      showInPayslip: true,
    })
  }

  const handleAddNew = () => {
    setEditingElement(null)
    resetForm()
    setShowModal(true)
  }

  const exportToExcel = () => {
    const data = filteredElements.map((el) => ({
      Code: el.code,
      Name: el.name,
      'Name (Arabic)': el.nameArabic || '',
      Type: el.type,
      Category: el.category,
      'Recurring': el.isRecurring ? 'Yes' : 'No',
      'Statutory': el.isStatutory ? 'Yes' : 'No',
      'Taxable': el.isTaxable ? 'Yes' : 'No',
      'Calculation Method': el.calculationMethod,
      'Default Amount': el.defaultAmount || '',
      Country: el.countryCode || 'Global',
      Status: el.isActive ? 'Active' : 'Inactive',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Elements')

    const fileName = `payroll-elements-${country || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toast({
      title: 'Success',
      description: 'Data exported successfully',
    })
  }

  // Calculate stats
  const stats = {
    total: filteredElements.length,
    earnings: filteredElements.filter((el) => el.type === 'EARNING').length,
    deductions: filteredElements.filter((el) => el.type === 'DEDUCTION').length,
    statutory: filteredElements.filter((el) => el.isStatutory).length,
    permanent: filteredElements.filter((el) => el.isRecurring).length,
    temporary: filteredElements.filter((el) => !el.isRecurring).length,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payroll Elements Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure country-specific payroll elements with compliance rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Element
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Elements</div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Earnings</div>
                <div className="mt-2 text-3xl font-bold text-green-600">{stats.earnings}</div>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Deductions</div>
                <div className="mt-2 text-3xl font-bold text-red-600">{stats.deductions}</div>
              </div>
              <TrendingDown className="h-10 w-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Statutory</div>
                <div className="mt-2 text-3xl font-bold text-purple-600">{stats.statutory}</div>
              </div>
              <Shield className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Permanent</div>
                <div className="mt-2 text-3xl font-bold text-orange-600">{stats.permanent}</div>
              </div>
              <Calendar className="h-10 w-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Temporary</div>
                <div className="mt-2 text-3xl font-bold text-pink-600">{stats.temporary}</div>
              </div>
              <Zap className="h-10 w-10 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="EARNING">Earnings</SelectItem>
                  <SelectItem value="DEDUCTION">Deductions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Statutory</Label>
              <Select value={filterStatutory} onValueChange={setFilterStatutory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="YES">Statutory Only</SelectItem>
                  <SelectItem value="NO">Non-Statutory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Recurring</Label>
              <Select value={filterRecurring} onValueChange={setFilterRecurring}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="YES">Permanent</SelectItem>
                  <SelectItem value="NO">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Country</Label>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Countries</SelectItem>
                  <SelectItem value="INDIA">India</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Elements ({filteredElements.length})</CardTitle>
          <CardDescription>Manage earnings, deductions, and statutory elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Recurring</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Statutory</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Calculation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Country</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredElements.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No elements found. Click &quot;Add Element&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filteredElements.map((element) => (
                    <tr key={element.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono font-semibold">{element.code}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{element.name}</div>
                        {element.nameArabic && (
                          <div className="text-xs text-gray-500">{element.nameArabic}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            element.type === 'EARNING'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {element.type === 'EARNING' ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {element.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{element.category.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-center">
                        {element.isRecurring ? (
                          <span className="inline-flex items-center text-orange-600" title="Permanent">
                            <Calendar className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-pink-600" title="Temporary">
                            <Zap className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {element.isStatutory ? (
                          <span className="inline-flex items-center text-purple-600" title="Statutory">
                            <Shield className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calculator className="h-3 w-3 text-gray-500" />
                          {element.calculationMethod}
                        </div>
                        {element.calculationMethod === 'PERCENTAGE' && (
                          <div className="text-xs text-gray-500">
                            {element.percentage}% of {element.percentageOf}
                          </div>
                        )}
                        {element.calculationMethod === 'FIXED' && element.defaultAmount && (
                          <div className="text-xs text-gray-500">
                            {formatCurrency(element.defaultAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-500" />
                          {element.countryCode || 'Global'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {element.isActive ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-400">
                            <XCircle className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(element)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!element.isSystemDefined && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(element.id, element)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingElement ? 'Edit Payroll Element' : 'Add New Payroll Element'}
            </DialogTitle>
            <DialogDescription>
              Configure payroll element with calculation rules and compliance settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Element Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., BASIC, HRA, PF"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    disabled={!!editingElement}
                  />
                </div>

                <div>
                  <Label>
                    Element Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Basic Salary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Arabic Name</Label>
                  <Input
                    placeholder="الراتب الأساسي"
                    value={formData.nameArabic}
                    onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                  />
                </div>

                <div>
                  <Label>
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'EARNING' | 'DEDUCTION') =>
                      setFormData({ ...formData, type: value, category: elementCategories[value][0] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EARNING">Earning</SelectItem>
                      <SelectItem value="DEDUCTION">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.type &&
                        elementCategories[formData.type].map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Country</Label>
                  <Select
                    value={formData.countryCode || 'GLOBAL'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, countryCode: value === 'GLOBAL' ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Global (All Countries)</SelectItem>
                      <SelectItem value="INDIA">India</SelectItem>
                      <SelectItem value="UAE">UAE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Element description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Calculation Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Calculation Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calculation Method</Label>
                  <Select
                    value={formData.calculationMethod}
                    onValueChange={(value: 'FIXED' | 'PERCENTAGE' | 'PRORATED') =>
                      setFormData({ ...formData, calculationMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="PRORATED">Prorated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.calculationMethod === 'FIXED' && (
                  <div>
                    <Label>Default Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.defaultAmount || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultAmount: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                )}

                {formData.calculationMethod === 'PERCENTAGE' && (
                  <>
                    <div>
                      <Label>Percentage (%)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.percentage || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label>Percentage Of</Label>
                      <Input
                        placeholder="e.g., BASIC, GROSS"
                        value={formData.percentageOf || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, percentageOf: e.target.value.toUpperCase() })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Properties</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isRecurring">Permanent Element (Recurring)</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTaxable"
                    checked={formData.isTaxable}
                    onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isTaxable">Taxable</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isStatutory"
                    checked={formData.isStatutory}
                    onChange={(e) => setFormData({ ...formData, isStatutory: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isStatutory">Statutory Element</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInPayslip"
                    checked={formData.showInPayslip}
                    onChange={(e) => setFormData({ ...formData, showInPayslip: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="showInPayslip">Show in Payslip</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingElement(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {editingElement ? 'Update Element' : 'Create Element'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
