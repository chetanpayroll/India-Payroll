"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CountryProvider, useCountry } from '@/lib/context/CountryContext'
import { COUNTRY_CONFIGS } from '@/lib/payroll/core/countryConfig'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingParticles from '@/components/FloatingParticles'
import AnimatedGradient from '@/components/AnimatedGradient'
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
  TrendingUp,
  Globe
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

// Country Selector Component
function CountrySelector() {
  const router = useRouter()
  const { country, countryConfig } = useCountry()

  if (!country || !countryConfig) {
    return null
  }

  return (
    <button
      onClick={() => router.push('/dashboard/country-select')}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-xl transition-all hover-lift transform-3d animate-pulse-glow"
      title="Change country"
    >
      <Globe className="h-4 w-4 text-blue-600" />
      <span className="text-2xl">{countryConfig.uiConfig.flagEmoji}</span>
      <div className="text-left hidden md:block">
        <div className="text-xs font-medium text-gray-900">{countryConfig.name}</div>
        <div className="text-xs text-gray-500">{countryConfig.currency}</div>
      </div>
    </button>
  )
}

// Main Layout Content Component
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('demoUser')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Animated Background Effects */}
      <AnimatedBackground />
      <FloatingParticles />
      <AnimatedGradient />

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
          fixed inset-y-0 left-0 z-50 w-64 glass-effect backdrop-blur-2xl bg-white/80 border-r border-white/20 transform transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col shadow-2xl
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse-glow group-hover:scale-110 transition-transform">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">GMP Payroll</span>
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
                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover-lift transform-3d
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg border border-blue-200/50'
                          : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-md'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600 animate-scale-pulse' : ''}`} />
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
        <div className="p-4 border-t border-white/20">
          <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-3 shadow-md border border-blue-100">
            <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Demo User</p>
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
      <div className="flex-1 min-w-0 relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 glass-effect backdrop-blur-2xl bg-white/60 border-b border-white/20 lg:px-8 shadow-lg">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-400" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {/* Country Selector */}
            <CountrySelector />

            <div className="hidden md:block">
              <div className="text-sm text-gray-500">Today&apos;s Date</div>
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
  )
}

// Main export with CountryProvider wrapper
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CountryProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </CountryProvider>
  )
}
