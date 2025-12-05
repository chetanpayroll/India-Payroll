import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'GMP Payroll - Enterprise Payroll Management System',
  description: 'Enterprise-grade payroll management system for India businesses with PF, ESI, PT, and TDS compliance',
  keywords: 'India payroll, PF, ESI, PT, TDS, salary management, payroll software, enterprise HR, Form 16',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  )
}
