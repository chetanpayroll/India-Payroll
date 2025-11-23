import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

export const metadata: Metadata = {
  title: 'GMP Payroll - Enterprise Payroll Management System',
  description: 'Enterprise-grade payroll management system for UAE businesses with WPS and GPSSA compliance',
  keywords: 'UAE payroll, WPS, GPSSA, salary management, payroll software, enterprise HR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}
