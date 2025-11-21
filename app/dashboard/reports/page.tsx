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
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Search,
  Eye,
  BarChart3,
  PieChart,
  DollarSign,
  Building2,
  FileSpreadsheet,
  FileCheck,
  ChevronDown,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react'

// Report categories with comprehensive options
const reportCategories = [
  {
    id: 'payroll',
    name: 'Payroll Reports',
    icon: DollarSign,
    color: 'blue',
    reports: [
      { id: 'monthly-summary', name: 'Monthly Payroll Summary', description: 'Complete payroll breakdown by month' },
      { id: 'payroll-register', name: 'Payroll Register', description: 'Detailed payroll register with all elements' },
      { id: 'bank-transfer', name: 'Bank Transfer Report', description: 'Bank transfer summary for payment processing' },
      { id: 'payroll-variance', name: 'Payroll Variance Analysis', description: 'Compare payroll across months' },
      { id: 'cost-center', name: 'Cost Center Report', description: 'Payroll costs by department/cost center' },
    ]
  },
  {
    id: 'compliance',
    name: 'UAE Compliance',
    icon: FileCheck,
    color: 'green',
    reports: [
      { id: 'wps-file', name: 'WPS SIF File', description: 'Generate WPS file for bank submission' },
      { id: 'gpssa-monthly', name: 'GPSSA Monthly Report', description: 'GPSSA contribution report for Emiratis' },
      { id: 'mol-report', name: 'MOL Labour Report', description: 'Ministry of Labour compliance report' },
      { id: 'end-of-service', name: 'End of Service Benefits', description: 'Calculate gratuity and benefits' },
    ]
  },
  {
    id: 'employee',
    name: 'Employee Reports',
    icon: Users,
    color: 'purple',
    reports: [
      { id: 'employee-master', name: 'Employee Master List', description: 'Complete employee directory' },
      { id: 'headcount', name: 'Headcount Analysis', description: 'Employee count by department, nationality' },
      { id: 'joiners-leavers', name: 'Joiners & Leavers', description: 'New hires and terminations' },
      { id: 'salary-structure', name: 'Salary Structure Report', description: 'Detailed salary breakdown by employee' },
      { id: 'employee-analytics', name: 'Employee Analytics', description: 'Demographics and statistics' },
    ]
  },
  {
    id: 'statutory',
    name: 'Statutory Reports',
    icon: FileText,
    color: 'orange',
    reports: [
      { id: 'tax-deductions', name: 'Tax Deduction Report', description: 'Tax withholdings and deductions' },
      { id: 'social-security', name: 'Social Security Summary', description: 'GPSSA and pension contributions' },
      { id: 'annual-statement', name: 'Annual Salary Statement', description: 'Year-end salary statements' },
      { id: 'audit-trail', name: 'Audit Trail Report', description: 'Complete audit log of changes' },
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    icon: BarChart3,
    color: 'cyan',
    reports: [
      { id: 'payroll-trends', name: 'Payroll Trends', description: 'Historical payroll analysis' },
      { id: 'turnover-analysis', name: 'Turnover Analysis', description: 'Employee retention metrics' },
      { id: 'salary-benchmarking', name: 'Salary Benchmarking', description: 'Compare salaries across roles' },
      { id: 'workforce-planning', name: 'Workforce Planning', description: 'Future headcount projections' },
    ]
  },
]

// Sample recent reports
const recentReports = [
  {
    id: '1',
    name: 'October 2024 Payroll Summary',
    type: 'Monthly Payroll Summary',
    generatedDate: '2024-10-28',
    size: '2.4 MB',
    format: 'PDF',
    status: 'completed'
  },
  {
    id: '2',
    name: 'October 2024 WPS File',
    type: 'WPS SIF File',
    generatedDate: '2024-10-28',
    size: '156 KB',
    format: 'SIF',
    status: 'completed'
  },
  {
    id: '3',
    name: 'Q3 2024 GPSSA Report',
    type: 'GPSSA Monthly Report',
    generatedDate: '2024-09-30',
    size: '1.1 MB',
    format: 'XLSX',
    status: 'completed'
  },
  {
    id: '4',
    name: 'Employee Master List - November',
    type: 'Employee Master List',
    generatedDate: '2024-11-01',
    size: '890 KB',
    format: 'XLSX',
    status: 'completed'
  },
]

type Report = {
  id: string
  name: string
  description: string
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<Report | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    dateFrom: '',
    dateTo: '',
    format: 'pdf',
    entity: 'all',
    includeCharts: true
  })

  const filteredCategories = selectedCategory
    ? reportCategories.filter(cat => cat.id === selectedCategory)
    : reportCategories

  const handleGenerateReport = (report: Report) => {
    setCurrentReport(report)
    setGenerationComplete(false)
    setIsGenerating(false)
    setIsGenerateModalOpen(true)
  }

  const handlePreviewReport = (report: Report) => {
    setCurrentReport(report)
    setIsPreviewModalOpen(true)
  }

  const executeGeneration = () => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationComplete(true)
    }, 2000)
  }

  const handleDownload = () => {
    // In a real app, this would trigger file download
    console.log('Downloading report:', currentReport?.name, reportConfig)
    setIsGenerateModalOpen(false)
    setGenerationComplete(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">
          Generate comprehensive payroll, compliance, and employee reports
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">124</p>
                <p className="mt-2 text-sm text-green-600">This month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WPS Files</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
                <p className="mt-2 text-sm text-gray-500">Last 12 months</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GPSSA Reports</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">8</p>
                <p className="mt-2 text-sm text-gray-500">Last 12 months</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">156 MB</p>
                <p className="mt-2 text-sm text-gray-500">All reports</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileSpreadsheet className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="space-y-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
          }

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.reports.length} reports available</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.reports.map((report) => (
                    <div
                      key={report.id}
                      className="group relative p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {report.name}
                        </h4>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={(e) => {
                          e.stopPropagation()
                          handleGenerateReport(report)
                        }}>
                          <FileText className="h-3 w-3 mr-1" />
                          Generate
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation()
                          handlePreviewReport(report)
                        }}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your recently generated reports</CardDescription>
            </div>
            <Button variant="outline">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {report.format === 'PDF' && <FileText className="h-5 w-5 text-red-600" />}
                    {report.format === 'XLSX' && <FileSpreadsheet className="h-5 w-5 text-green-600" />}
                    {report.format === 'SIF' && <FileCheck className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{report.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">{report.type}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{report.size}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(report.generatedDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {report.status}
                  </span>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Need Custom Reports?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Create custom reports with advanced filters and analytics
                </p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Custom Report Builder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Generate Report
            </DialogTitle>
            <DialogDescription>
              Configure and generate: {currentReport?.name}
            </DialogDescription>
          </DialogHeader>

          {!generationComplete ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={reportConfig.dateFrom}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={reportConfig.dateTo}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Business Entity</Label>
                <Select value={reportConfig.entity} onValueChange={(value) => setReportConfig(prev => ({ ...prev, entity: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="gmp-trading">GMP Trading LLC</SelectItem>
                    <SelectItem value="gmp-services">GMP Services FZE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select value={reportConfig.format} onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeCharts" className="text-sm cursor-pointer">Include charts and visualizations</Label>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Generated Successfully!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your {currentReport?.name} is ready for download.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {reportConfig.format.toUpperCase()}
                </span>
                <span>•</span>
                <span>2.4 MB</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
              {generationComplete ? 'Close' : 'Cancel'}
            </Button>
            {!generationComplete ? (
              <Button onClick={executeGeneration} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Report Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Report Preview
            </DialogTitle>
            <DialogDescription>
              Preview: {currentReport?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="border rounded-lg p-6 bg-gray-50 min-h-[300px]">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{currentReport?.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>

              {/* Sample Preview Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border text-center">
                    <p className="text-2xl font-bold text-blue-600">AED 245,680</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border text-center">
                    <p className="text-2xl font-bold text-green-600">48</p>
                    <p className="text-sm text-gray-500">Employees</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border text-center">
                    <p className="text-2xl font-bold text-purple-600">2</p>
                    <p className="text-sm text-gray-500">Entities</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-3">Sample Data Preview</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Employee</th>
                          <th className="text-left py-2 px-2">Department</th>
                          <th className="text-right py-2 px-2">Basic</th>
                          <th className="text-right py-2 px-2">Allowances</th>
                          <th className="text-right py-2 px-2">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-2">Ahmed M.</td>
                          <td className="py-2 px-2">Finance</td>
                          <td className="text-right py-2 px-2">8,500</td>
                          <td className="text-right py-2 px-2">3,200</td>
                          <td className="text-right py-2 px-2 font-semibold">11,700</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-2">Sarah J.</td>
                          <td className="py-2 px-2">IT</td>
                          <td className="text-right py-2 px-2">12,000</td>
                          <td className="text-right py-2 px-2">4,500</td>
                          <td className="text-right py-2 px-2 font-semibold">16,500</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">Mohammed A.</td>
                          <td className="py-2 px-2">Operations</td>
                          <td className="text-right py-2 px-2">6,800</td>
                          <td className="text-right py-2 px-2">2,100</td>
                          <td className="text-right py-2 px-2 font-semibold">8,900</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">... and 45 more records</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsPreviewModalOpen(false)
              if (currentReport) handleGenerateReport(currentReport)
            }}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Full Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
