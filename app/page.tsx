import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Calculator, 
  FileText, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">GMP Payroll</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Pricing</Link>
            <Link href="#contact" className="text-gray-600 hover:text-blue-600 transition">Contact</Link>
            <Link href="/auth/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            🇦🇪 UAE Compliant Payroll System
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Payroll Management Made
            <span className="text-blue-600"> Simple & Compliant</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete payroll solution for UAE businesses with WPS, GPSSA compliance, 
            automated calculations, and instant payslip generation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Companies Trust Us</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Employees Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600">UAE Compliant</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for UAE Payroll
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for UAE labor law and compliance requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Employee Management</h3>
            <p className="text-gray-600">
              Complete employee database with Emirates ID, passport details, and contract management.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Automated Calculations</h3>
            <p className="text-gray-600">
              Accurate salary calculations with proration, overtime, allowances, and deductions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">WPS Compliance</h3>
            <p className="text-gray-600">
              Generate WPS SIF files in correct format for all UAE banks and wage protection system.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">GPSSA Calculations</h3>
            <p className="text-gray-600">
              Automatic GPSSA contribution calculations for Emirati employees with detailed reports.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Professional Payslips</h3>
            <p className="text-gray-600">
              Generate beautiful, bilingual payslips in PDF format with complete earnings breakdown.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
            <p className="text-gray-600">
              Real-time insights into payroll costs, trends, and employee distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Why Choose GMP Payroll?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Save 10+ hours every month on payroll processing',
                'Zero errors in salary calculations and compliance',
                'Instant WPS file generation for bank transfers',
                'Automatic GPSSA contribution calculations',
                'Secure cloud storage with 7-year retention',
                'Mobile-friendly access from anywhere',
                'Multi-entity and multi-location support',
                'Export reports in Excel, PDF, and CSV formats'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Simplify Your Payroll?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of UAE businesses who trust GMP Payroll
          </p>
          <Link href="/auth/login">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Now - It's Free!
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">GMP Payroll</span>
              </div>
              <p className="text-gray-600">
                UAE's most trusted payroll management system
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#demo">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#about">About Us</Link></li>
                <li><Link href="#contact">Contact</Link></li>
                <li><Link href="#careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#privacy">Privacy Policy</Link></li>
                <li><Link href="#terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 GMP Payroll. All rights reserved. Made in UAE 🇦🇪</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
