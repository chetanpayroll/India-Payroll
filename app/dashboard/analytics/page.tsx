"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

export default function AnalyticsPage() {
  // Sample data for charts
  const payrollTrend = [
    { month: 'Jan', payroll: 450000, budget: 500000 },
    { month: 'Feb', payroll: 465000, budget: 500000 },
    { month: 'Mar', payroll: 478000, budget: 500000 },
    { month: 'Apr', payroll: 492000, budget: 500000 },
    { month: 'May', payroll: 485000, budget: 500000 },
    { month: 'Jun', payroll: 510000, budget: 500000 },
    { month: 'Jul', payroll: 505000, budget: 520000 },
    { month: 'Aug', payroll: 515000, budget: 520000 },
    { month: 'Sep', payroll: 520000, budget: 520000 },
    { month: 'Oct', payroll: 530000, budget: 540000 },
    { month: 'Nov', payroll: 535000, budget: 540000 },
    { month: 'Dec', payroll: 550000, budget: 560000 }
  ]

  const headcountTrend = [
    { month: 'Jan', count: 142, hires: 5, exits: 2 },
    { month: 'Feb', count: 145, hires: 6, exits: 3 },
    { month: 'Mar', count: 148, hires: 4, exits: 1 },
    { month: 'Apr', count: 151, hires: 5, exits: 2 },
    { month: 'May', count: 154, hires: 7, exits: 4 },
    { month: 'Jun', count: 157, hires: 6, exits: 3 },
    { month: 'Jul', count: 160, hires: 5, exits: 2 },
    { month: 'Aug', count: 163, hires: 8, exits: 5 },
    { month: 'Sep', count: 166, hires: 6, exits: 3 },
    { month: 'Oct', count: 169, hires: 5, exits: 2 },
    { month: 'Nov', count: 172, hires: 7, exits: 4 },
    { month: 'Dec', count: 175, hires: 6, exits: 3 }
  ]

  const departmentCosts = [
    { department: 'IT', cost: 125000, employees: 28 },
    { department: 'Sales', cost: 145000, employees: 35 },
    { department: 'HR', cost: 65000, employees: 18 },
    { department: 'Finance', cost: 95000, employees: 22 },
    { department: 'Operations', cost: 155000, employees: 42 },
    { department: 'Marketing', cost: 85000, employees: 20 }
  ]

  const performanceData = [
    { category: 'Productivity', value: 85 },
    { category: 'Quality', value: 90 },
    { category: 'Teamwork', value: 88 },
    { category: 'Innovation', value: 78 },
    { category: 'Leadership', value: 82 },
    { category: 'Communication', value: 86 }
  ]

  const genderDistribution = [
    { name: 'Male', value: 98, color: '#3b82f6' },
    { name: 'Female', value: 77, color: '#ec4899' }
  ]

  const nationalityDistribution = [
    { name: 'UAE', value: 35, color: '#10b981' },
    { name: 'India', value: 45, color: '#f59e0b' },
    { name: 'Pakistan', value: 28, color: '#3b82f6' },
    { name: 'Philippines', value: 32, color: '#8b5cf6' },
    { name: 'Others', value: 35, color: '#06b6d4' }
  ]

  const kpis = [
    {
      title: 'Total Payroll Cost',
      value: 'AED 535,000',
      change: '+3.2%',
      changeType: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Cost Per Employee',
      value: 'AED 3,110',
      change: '-1.5%',
      changeType: 'down',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Turnover Rate',
      value: '4.2%',
      change: '-0.8%',
      changeType: 'down',
      icon: TrendingDown,
      color: 'purple'
    },
    {
      title: 'Average Tenure',
      value: '3.2 years',
      change: '+0.3',
      changeType: 'up',
      icon: Activity,
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            Business Intelligence & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive workforce and payroll analytics dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Select Period
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const isPositive = kpi.changeType === 'up' && (kpi.title.includes('Payroll') || kpi.title.includes('Tenure'))
            || kpi.changeType === 'down' && (kpi.title.includes('Turnover') || kpi.title.includes('Cost Per'))

          return (
            <Card key={kpi.title} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    kpi.color === 'green' ? 'bg-green-100' :
                    kpi.color === 'blue' ? 'bg-blue-100' :
                    kpi.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      kpi.color === 'green' ? 'text-green-600' :
                      kpi.color === 'blue' ? 'text-blue-600' :
                      kpi.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.changeType === 'up' ? (
                      <ArrowUpRight className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <ArrowDownRight className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    )}
                    <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payroll Trend */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Annual Payroll Trend
            </CardTitle>
            <CardDescription>Monthly payroll cost vs budget</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={payrollTrend}>
                <defs>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `AED ${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="budget" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBudget)" name="Budget" />
                <Area type="monotone" dataKey="payroll" stroke="#10b981" fillOpacity={1} fill="url(#colorPayroll)" name="Actual Payroll" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Headcount Trend */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Headcount Evolution
            </CardTitle>
            <CardDescription>Employee growth and attrition trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={headcountTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="Total Headcount" />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="New Hires" />
                <Line type="monotone" dataKey="exits" stroke="#ef4444" strokeWidth={2} name="Exits" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Costs */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Department Cost Analysis
            </CardTitle>
            <CardDescription>Payroll cost distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={departmentCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value: any) => `AED ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="cost" fill="#8b5cf6" name="Total Cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Average employee performance scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gender Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-pink-600" />
              Gender Distribution
            </CardTitle>
            <CardDescription>Workforce diversity analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nationality Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              Nationality Distribution
            </CardTitle>
            <CardDescription>Employee demographics by nationality</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={nationalityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nationalityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <TrendingUp className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Workforce Growth</h3>
            <p className="text-3xl font-bold mb-2">23%</p>
            <p className="text-sm opacity-90">Year-over-year headcount increase</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <DollarSign className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Payroll Efficiency</h3>
            <p className="text-3xl font-bold mb-2">96%</p>
            <p className="text-sm opacity-90">On-time processing rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <Activity className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Employee Retention</h3>
            <p className="text-3xl font-bold mb-2">95.8%</p>
            <p className="text-sm opacity-90">Annual retention rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
