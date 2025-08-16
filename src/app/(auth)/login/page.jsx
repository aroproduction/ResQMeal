"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, ArrowRight, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { signIn, useSession, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Role-based redirection logic
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "PROVIDER":
        return "/provider"
      case "RECEIVER":
        return "/receiver"
      case "ADMIN":
        return "/admin"
      default:
        return "/dashboard" // fallback
    }
  }

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const redirectPath = redirectBasedOnRole(session.user.role)
      router.push(redirectPath)
    }
  }, [session, status, router])

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    toast.loading("Signing you in...")

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        ...formData,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.")
      } else {
        toast.success("Welcome back!")
        // Get the updated session to access user role
        const updatedSession = await getSession()
        if (updatedSession?.user?.role) {
          const redirectPath = redirectBasedOnRole(updatedSession.user.role)
          router.push(redirectPath)
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setTimeout(() => {
        toast.dismiss()
      }, 3000)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 font-body">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-heading">
              ResQMeal
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl text-gray-900 mb-2 font-heading">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600 font-body">Sign in to continue making a difference</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-heading">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-12 text-base font-body"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 font-heading">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 h-12 border-gray-200  focus:outline-none text-base font-body"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors font-body"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 h-12 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] group cursor-pointer font-heading"
              >
                {isLoading ? "Signing In..." : "Login"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 font-body">
                New here?{" "}
                <Link
                  href="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors font-heading"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
