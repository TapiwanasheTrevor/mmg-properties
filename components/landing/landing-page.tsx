"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Wrench, BarChart3, Shield, Zap, CheckCircle, ArrowRight, Eye, EyeOff } from "lucide-react"

interface LandingPageProps {
  onLogin: (role: "admin" | "owner" | "agent" | "tenant") => void
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (role: "admin" | "owner" | "agent" | "tenant") => {
    setIsLoading(true)
    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    onLogin(role)
  }

  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Manage multiple properties with ease and efficiency",
    },
    {
      icon: Users,
      title: "Tenant Relations",
      description: "Streamline tenant communications and lease management",
    },
    {
      icon: Wrench,
      title: "Maintenance Tracking",
      description: "Track and resolve maintenance requests quickly",
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Comprehensive financial analytics and reporting",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Stay informed with instant notifications",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Bezier Curves */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,200 C300,100 600,300 1200,150 L1200,0 L0,0 Z" fill="url(#gradient1)" fillOpacity="0.1" />
          <path d="M0,400 C400,300 800,500 1200,350 L1200,0 L0,0 Z" fill="url(#gradient2)" fillOpacity="0.05" />
          <path d="M0,800 C300,700 900,600 1200,650 L1200,800 L0,800 Z" fill="url(#gradient3)" fillOpacity="0.1" />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding and Features */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
          <div className="max-w-2xl">
            {/* Logo and Branding */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MMG
                </h1>
                <p className="text-xl text-gray-600 font-medium">Property Management Platform</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Streamline Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Property Management
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Manage properties, tenants, maintenance, and finances all in one powerful platform. Built for property
                managers, owners, and agents.
              </p>

              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Multi-role Dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Secure & Reliable</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <feature.icon className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login/Onboarding */}
        <div className="w-full max-w-md flex items-center justify-center p-8">
          <Card className="w-full bg-white/80 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your property management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="demo">Quick Demo</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="bg-white/50 border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="bg-white/50 border-white/20 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => handleLogin("admin")}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button variant="link" className="text-sm text-gray-600">
                      Forgot your password?
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="demo" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-4">Explore the platform with different user roles</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white/50 border-white/20 hover:bg-white/70"
                      onClick={() => handleLogin("admin")}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">System Administrator</p>
                          <p className="text-xs text-gray-500">Full platform access</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Admin</Badge>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white/50 border-white/20 hover:bg-white/70"
                      onClick={() => handleLogin("owner")}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Property Owner</p>
                          <p className="text-xs text-gray-500">Manage your properties</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Owner</Badge>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white/50 border-white/20 hover:bg-white/70"
                      onClick={() => handleLogin("agent")}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Property Agent</p>
                          <p className="text-xs text-gray-500">Manage assigned properties</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Agent</Badge>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white/50 border-white/20 hover:bg-white/70"
                      onClick={() => handleLogin("tenant")}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Tenant</p>
                          <p className="text-xs text-gray-500">Access your rental info</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Tenant</Badge>
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">No registration required for demo</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Floating Elements */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-6">
          <span>© 2024 MMG Property Management</span>
          <span>•</span>
          <Button variant="link" className="text-gray-500 p-0 h-auto">
            Privacy Policy
          </Button>
          <span>•</span>
          <Button variant="link" className="text-gray-500 p-0 h-auto">
            Terms of Service
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-white/50">
            v2.1.0
          </Badge>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
