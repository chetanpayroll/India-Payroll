"use client"

import { useState } from 'react'
import { useCountry } from '@/lib/context/CountryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  Building2,
  Users,
  DollarSign,
  Bell,
  Shield,
  Key,
  Mail,
  Smartphone,
  Globe,
  Database,
  FileText,
  Calendar,
  CreditCard,
  CheckCircle2,
  Save,
  RefreshCw
} from 'lucide-react'

const settingsSections = [
  {
    id: 'organization',
    name: 'Organization',
    icon: Building2,
    description: 'Company details and business information'
  },
  {
    id: 'payroll',
    name: 'Payroll Configuration',
    icon: DollarSign,
    description: 'Payroll processing settings and defaults'
  },
  {
    id: 'users',
    name: 'Users & Permissions',
    icon: Users,
    description: 'Manage user accounts and access control'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    description: 'Email and system notifications'
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Security settings and authentication'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Globe,
    description: 'Third-party integrations and APIs'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: CreditCard,
    description: 'Subscription and payment details'
  },
]

export default function SettingsPage() {
  const { country, countryConfig } = useCountry()
  const [activeSection, setActiveSection] = useState('organization')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your system preferences and configurations
          {country && <span className="ml-2 text-blue-600">({countryConfig?.name})</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{section.name}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Organization Settings */}
          {activeSection === 'organization' && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Update your company details and business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="GMP Trading LLC" />
                  </div>
                  <div>
                    <Label htmlFor="trade-license">Trade License Number</Label>
                    <Input id="trade-license" defaultValue="TL-234567" />
                  </div>
                  <div>
                    <Label htmlFor="tax-registration">Tax Registration Number</Label>
                    <Input id="tax-registration" defaultValue="TRN-987654321" />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" defaultValue="Trading & Services" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input id="address" defaultValue="Business Bay, Dubai, UAE" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" defaultValue="info@gmptrading.ae" />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input id="contact-phone" defaultValue="+971 4 123 4567" />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payroll Configuration */}
          {activeSection === 'payroll' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Processing Defaults</CardTitle>
                  <CardDescription>
                    Configure default settings for payroll processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="payroll-frequency">Payroll Frequency</Label>
                      <select id="payroll-frequency" className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md">
                        <option>Monthly</option>
                        <option>Bi-weekly</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="payment-date">Default Payment Date</Label>
                      <Input id="payment-date" type="number" defaultValue="25" min="1" max="28" />
                      <p className="text-xs text-gray-500 mt-1">Day of month (1-28)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select id="currency" className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md">
                        {country === 'INDIA' ? (
                          <>
                            <option>INR - Indian Rupee</option>
                            <option>USD - US Dollar</option>
                          </>
                        ) : (
                          <>
                            <option>AED - UAE Dirham</option>
                            <option>USD - US Dollar</option>
                            <option>EUR - Euro</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="working-days">Working Days per Month</Label>
                      <Input id="working-days" type="number" defaultValue="26" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      {country === 'INDIA' ? 'India Compliance Settings' : 'UAE Compliance Settings'}
                    </h4>

                    {country === 'INDIA' ? (
                      <>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">PF Calculations</p>
                            <p className="text-sm text-gray-600">Auto-calculate EPF/EPS contributions</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm text-green-600">Enabled</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">ESIC Calculations</p>
                            <p className="text-sm text-gray-600">Auto-calculate ESIC for eligible employees</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm text-green-600">Enabled</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">TDS Calculations</p>
                            <p className="text-sm text-gray-600">Auto-calculate income tax deductions</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm text-green-600">Enabled</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Professional Tax</p>
                            <p className="text-sm text-gray-600">Auto-calculate PT based on state</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm text-green-600">Enabled</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">WPS File Generation</p>
                            <p className="text-sm text-gray-600">Automatically generate WPS files after finalization</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm text-green-600">Enabled</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">GPSSA Calculations</p>
                            <p className="text-sm text-gray-600">Auto-calculate GPSSA for Emirati employees</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="w-4 h-4" />
                            <span className="text-sm text-green-600">Enabled</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Elements</CardTitle>
                  <CardDescription>
                    Manage earning and deduction elements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(country === 'INDIA'
                      ? ['Basic Salary', 'HRA (House Rent Allowance)', 'Special Allowance', 'PF Deduction', 'ESIC Deduction', 'Professional Tax', 'TDS']
                      : ['Basic Salary', 'Housing Allowance', 'Transport Allowance', 'GPSSA Deduction']
                    ).map((element, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900">{element}</span>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Salary Element
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users & Permissions */}
          {activeSection === 'users' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Admin User', email: 'admin@company.com', role: 'Administrator', status: 'Active' },
                    { name: 'HR Manager', email: 'hr@company.com', role: 'HR Manager', status: 'Active' },
                    { name: 'Finance User', email: 'finance@company.com', role: 'Finance', status: 'Active' },
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">{user.role}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.status}
                        </span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                  {[
                    { name: 'Payroll Finalized', description: 'Get notified when payroll is finalized' },
                    { name: 'New Employee Added', description: 'Notification when new employee joins' },
                    { name: 'WPS File Generated', description: 'Alert when WPS file is ready' },
                    { name: 'System Updates', description: 'Important system updates and announcements' },
                  ].map((notification, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{notification.name}</p>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                      <input type="checkbox" defaultChecked={idx < 3} className="w-4 h-4" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage authentication and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Change Password</Label>
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      <Input type="password" placeholder="Current Password" />
                      <Input type="password" placeholder="New Password" />
                      <Input type="password" placeholder="Confirm New Password" />
                    </div>
                    <Button className="mt-4">
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Enable 2FA</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button>Setup 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>
                    Active sessions and login history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome on Windows', location: 'Dubai, UAE', time: '2 hours ago', current: true },
                      { device: 'Safari on iPhone', location: 'Dubai, UAE', time: '1 day ago', current: false },
                    ].map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{session.device}</p>
                          <p className="text-sm text-gray-600">{session.location} • {session.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.current && (
                            <span className="text-xs font-medium text-green-600">Current Session</span>
                          )}
                          {!session.current && (
                            <Button variant="ghost" size="sm">Revoke</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect with third-party services and APIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Banking Integration', description: 'Connect to UAE banks for WPS submission', status: 'Connected', icon: CreditCard },
                    { name: 'Email Service', description: 'Send payslips and notifications via email', status: 'Connected', icon: Mail },
                    { name: 'SMS Gateway', description: 'Send SMS notifications to employees', status: 'Not Connected', icon: Smartphone },
                    { name: 'API Access', description: 'Integrate with your own systems', status: 'Available', icon: Database },
                  ].map((integration, idx) => {
                    const Icon = integration.icon
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{integration.name}</p>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            integration.status === 'Connected' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {integration.status}
                          </span>
                          <Button variant="outline" size="sm">
                            {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing */}
          {activeSection === 'billing' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Your subscription details and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-900">Professional Plan</h3>
                        <p className="text-blue-700">Up to 100 employees</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-900">AED 499</p>
                        <p className="text-sm text-blue-700">per month</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-800">Employees Used</span>
                        <span className="font-medium text-blue-900">48 / 100</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Manage your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="outline">Update</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your payment history and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: 'Nov 1, 2024', amount: 'AED 499.00', status: 'Paid', invoice: 'INV-2024-11' },
                      { date: 'Oct 1, 2024', amount: 'AED 499.00', status: 'Paid', invoice: 'INV-2024-10' },
                      { date: 'Sep 1, 2024', amount: 'AED 499.00', status: 'Paid', invoice: 'INV-2024-09' },
                    ].map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{payment.invoice}</p>
                          <p className="text-sm text-gray-600">{payment.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900">{payment.amount}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {payment.status}
                          </span>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
