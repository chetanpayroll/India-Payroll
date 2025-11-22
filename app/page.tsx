'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Button3D from '@/components/Button3D'
import Card3D from '@/components/Card3D'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingParticles from '@/components/FloatingParticles'
import AnimatedGradient from '@/components/AnimatedGradient'
import { motion } from 'framer-motion'
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <AnimatedBackground />
      <FloatingParticles />
      <AnimatedGradient />
      {/* Header */}
      <header className="border-b glass-effect backdrop-blur-2xl bg-white/60 border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse-glow group-hover:scale-110 transition-transform">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">GMP Payroll</span>
          </motion.div>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="#features" className="text-gray-700 hover:text-blue-600 transition font-medium">Features</Link>
            <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition font-medium">Pricing</Link>
            <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition font-medium">Contact</Link>
            <Link href="/auth/login">
              <Button3D variant="primary" magnetic>Get Started</Button3D>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6 px-6 py-3 glass-effect border-blue-200 rounded-full text-sm font-bold shadow-lg animate-pulse-glow"
          >
            🇦🇪 UAE & 🇮🇳 India Compliant Payroll System
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-6xl md:text-7xl font-black mb-8"
          >
            Payroll Management Made
            <span className="gradient-text neon-glow block mt-2"> Simple & Compliant</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-2xl text-gray-700 mb-10 font-medium"
          >
            Complete payroll solution for 🇦🇪 UAE businesses (WPS, GPSSA, End of Service)
            and 🇮🇳 India businesses (PF, ESI, PT, TDS) with automated compliance,
            calculations, and instant payslip generation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex gap-6 justify-center"
          >
            <Link href="/auth/login">
              <Button3D variant="primary" magnetic className="text-lg px-10 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button3D>
            </Link>
            <Link href="#demo">
              <Button3D variant="secondary" magnetic className="text-lg px-10 py-6">
                Watch Demo
              </Button3D>
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
        >
          {[
            { value: '500+', label: 'Companies Trust Us', delay: 0.9 },
            { value: '10K+', label: 'Employees Managed', delay: 1.0 },
            { value: '100%', label: 'Compliant', delay: 1.1 }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: stat.delay }}
            >
              <Card3D className="text-center p-8 border-0" glassEffect={true}>
                <div className="text-5xl font-black gradient-text mb-3">{stat.value}</div>
                <div className="text-gray-700 font-semibold text-lg">{stat.label}</div>
              </Card3D>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black gradient-text neon-glow mb-6">
            Everything You Need for Payroll
          </h2>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
            Powerful features designed for 🇦🇪 UAE & 🇮🇳 India labor law and compliance requirements
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card3D className="p-8 border-0 h-full" glassEffect={true}>
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Users className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Employee Management
              </h3>
              <p className="text-gray-700 font-medium">
                Complete employee database with Emirates ID, passport details, and contract management.
              </p>
            </Card3D>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card3D className="p-8 border-0 h-full" glassEffect={true}>
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Calculator className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Automated Calculations
              </h3>
              <p className="text-gray-700 font-medium">
                Accurate salary calculations with proration, overtime, allowances, and deductions for both countries.
              </p>
            </Card3D>
          </motion.div>

          {/* Feature 3 - UAE WPS */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card3D className="p-8 border-0 h-full" glassEffect={true}>
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                🇦🇪 UAE WPS Compliance
              </h3>
              <p className="text-gray-700 font-medium">
                Generate WPS SIF files in correct format for all UAE banks and wage protection system.
              </p>
            </Card3D>
          </motion.div>

          {/* Feature 4 - UAE GPSSA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card3D className="p-8 border-0 h-full" glassEffect={true}>
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                🇦🇪 UAE GPSSA Calculations
              </h3>
              <p className="text-gray-700 font-medium">
                Automatic GPSSA contribution calculations for Emirati employees with detailed reports.
              </p>
            </Card3D>
          </motion.div>

          {/* Feature 5 - India PF & ESI */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card3D className="p-8 border-0 h-full" glassEffect={true}>
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                🇮🇳 India PF & ESI Compliance
              </h3>
              <p className="text-gray-700 font-medium">
                Automated PF, ESI, PT, and TDS calculations with compliance reports for Indian labor laws.
              </p>
            </Card3D>
          </motion.div>

          {/* Feature 6 - Professional Payslips */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card3D className="p-8 border-0 h-full" glassEffect={true}>
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <FileText className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Professional Payslips
              </h3>
              <p className="text-gray-700 font-medium">
                Generate beautiful, bilingual payslips in PDF format with complete earnings breakdown for both countries.
              </p>
            </Card3D>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-gradient-shift"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-black mb-12 text-center drop-shadow-lg"
            >
              Why Choose GMP Payroll?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Save 10+ hours every month on payroll processing',
                'Zero errors in salary calculations and compliance',
                '🇦🇪 Instant WPS file generation for UAE bank transfers',
                '🇦🇪 Automatic GPSSA & End of Service calculations',
                '🇮🇳 Automated PF, ESI, PT, and TDS for India',
                '🇮🇳 India Form 16 and compliance reports generation',
                'Secure cloud storage with 7-year retention',
                'Mobile-friendly access from anywhere',
                'Multi-entity and multi-location support',
                'Export reports in Excel, PDF, and CSV formats'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                >
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1 drop-shadow-lg" />
                  <span className="text-lg font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl border border-white/20 relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>

          <h2 className="text-5xl font-black mb-4 relative z-10 drop-shadow-lg">
            Ready to Simplify Your Payroll?
          </h2>
          <p className="text-2xl mb-8 opacity-90 relative z-10 font-medium">
            Join hundreds of 🇦🇪 UAE & 🇮🇳 India businesses who trust GMP Payroll
          </p>
          <Link href="/auth/login">
            <Button3D variant="secondary" magnetic className="text-lg px-10 py-6 relative z-10">
              Get Started Now - It&apos;s Free!
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button3D>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-b from-gray-50 to-gray-100 relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">GMP Payroll</span>
              </div>
              <p className="text-gray-700 font-medium">
                🇦🇪 UAE & 🇮🇳 India&apos;s most trusted payroll management system
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#features" className="hover:text-blue-600 transition font-medium">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600 transition font-medium">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-blue-600 transition font-medium">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#about" className="hover:text-blue-600 transition font-medium">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-blue-600 transition font-medium">Contact</Link></li>
                <li><Link href="#careers" className="hover:text-blue-600 transition font-medium">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#privacy" className="hover:text-blue-600 transition font-medium">Privacy Policy</Link></li>
                <li><Link href="#terms" className="hover:text-blue-600 transition font-medium">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-gray-700 font-medium">&copy; 2024 GMP Payroll. All rights reserved.</p>
            <p className="text-gray-600 mt-2">Serving businesses in 🇦🇪 UAE & 🇮🇳 India with pride</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
