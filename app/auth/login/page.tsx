"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Lock, Mail, Globe, Shield, Zap, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "Login successful. Redirecting to dashboard...",
        })
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 animate-gradient-shift"
        style={{ backgroundSize: '400% 400%' }}></div>

      {/* Animated Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: '4s' }}></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side - Hero Content */}
        <div className="text-white space-y-8 hidden lg:block">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GMP Payroll</h1>
                <p className="text-sm text-purple-200">India Compliant</p>
              </div>
            </div>

            {/* Main Heading */}
            <div>
              <h2 className="text-5xl font-bold mb-4 leading-tight">
                Payroll Management
                <br />
                <span className="gradient-text">Made Simple</span>
              </h2>
              <p className="text-xl text-purple-200 leading-relaxed">
                & Compliant
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 mt-12">
              <div className="flex items-start gap-3 glass-effect-dark rounded-lg p-4 hover-lift">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Multi-Country Support</h3>
                  <p className="text-purple-200 text-sm">India payroll compliance built-in</p>
                </div>
              </div>

              <div className="flex items-start gap-3 glass-effect-dark rounded-lg p-4 hover-lift">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Statutory Compliance</h3>
                  <p className="text-purple-200 text-sm">PF, ESI, PT, TDS automated calculations</p>
                </div>
              </div>

              <div className="flex items-start gap-3 glass-effect-dark rounded-lg p-4 hover-lift">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Lightning Fast</h3>
                  <p className="text-purple-200 text-sm">Process payroll in seconds, not hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Calculator className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">GMP Payroll</h1>
            <p className="text-purple-200">Simple & Compliant</p>
          </div>

          {/* Login Card with Glassmorphism */}
          <Card className="glass-effect-dark border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
              <CardDescription className="text-purple-200">
                Enter your credentials to access your payroll dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:bg-white/20 focus:border-purple-400"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-purple-300 hover:text-purple-100 transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:bg-white/20 focus:border-purple-400"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Note */}
              <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-400/30 backdrop-blur-sm">
                <p className="text-sm text-green-200 font-bold mb-1">✨ Demo Mode Active</p>
                <p className="text-xs text-green-100">
                  <strong>Login with ANY email and password!</strong><br />
                  No registration needed. Perfect for testing and demos.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-purple-200">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-blue-300 hover:text-blue-100 font-medium transition">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-purple-200 hover:text-white transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
