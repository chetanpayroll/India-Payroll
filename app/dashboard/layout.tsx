"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CountryProvider } from '@/lib/context/CountryContext'
import {
  Calculator,
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  Clock,
  Briefcase,
  UserCheck,
  BarChart3,
  Calendar,
  TrendingUp
} from 'lucide-react'

const navigationSections = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Core HR',
    items: [
      { name: 'Employees', href: '/dashboard/employees', icon: Users },
      { name: 'HR Management', href: '/dashboard/hr', icon: Briefcase },
      { name: 'Attendance', href: '/dashboard/attendance', icon: UserCheck },
      { name: 'Leave', href: '/dashboard/leave', icon: Calendar },
    ]
  },
  {
    title: 'Payroll',
    items: [
      { name: 'Payroll', href: '/dashboard/payroll', icon: DollarSign },
      { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    ]
  },
  {
    title: 'Organization',
    items: [
      { name: 'Entities', href: '/dashboard/entities', icon: Building2 },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('demoUser')
    router.push('/auth/login')
  }

  return (
    <CountryProvider>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex-shrink-0 flex flex-col
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GMP Payroll</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
                      {item.name}
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto text-blue-600" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
            <p className="text-sm font-medium text-gray-900">Demo User</p>
            <p className="text-xs text-gray-500">demo@gmppayroll.org</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-400" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <div className="text-sm text-gray-500">Today's Date</div>
              <div className="text-sm font-medium">
                {new Date().toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </CountryProvider>
  )
}
