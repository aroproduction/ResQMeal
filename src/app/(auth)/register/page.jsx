"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Leaf, ArrowRight, User, Mail, Lock, Phone, Building, MapPin, Clock, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import axios from "axios";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    receiverType: "",
    ngoName: "",
    registrationNo: "",
    website: "",
    areasServed: "",
    capacity: "",
    organizationName: "",
    location: "",
    operatingHours: "",
  })
  const [currentStep, setCurrentStep] = useState(1) // 1: Form, 2: OTP Verification, 3: Success
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const startOtpTimer = () => {
    setOtpTimer(300) // 5 minutes
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendOTP = async () => {
    try {
      setIsLoading(true)
      const response = await axios.post("/api/auth/register/send_otp", {
        email: formData.email
      })

      if (response.data.success) {
        toast.success("OTP sent to your email!")
        setIsOtpSent(true)
        setCurrentStep(2)
        startOtpTimer()
      } else {
        toast.error(response.data.error?.message || "Failed to send OTP")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || "Failed to send OTP"
      toast.error(errorMessage)
      console.error("OTP send error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post("/api/auth/register/verify_email", {
        email: formData.email,
        otp
      })

      if (response.status === 200 && response.data.success) {
        toast.success("Email verified successfully!")
        await registerUser()
      } else {
        toast.error(response.data.message || "Invalid OTP")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to verify OTP"
      toast.error(errorMessage)
      console.error("OTP verification error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const registerUser = async () => {
    try {
      // Prepare the registration data according to the backend expectations
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role === "donor" ? "PROVIDER" : "RECEIVER",
        isNGO: formData.receiverType === "ngo",
        ngoData: formData.receiverType === "ngo" ? {
          ngoName: formData.ngoName,
          registrationNo: formData.registrationNo,
          website: formData.website,
          description: `NGO serving ${formData.areasServed} with capacity of ${formData.capacity} people per day`,
          servingAreas: [formData.areasServed], // Convert to array
          capacity: formData.capacity,
        } : null,
        providerData: formData.role === "donor" ? {
          businessName: formData.organizationName,
          licenseNo: "", // Not collected in current form
          operatingHours: {
            schedule: formData.operatingHours,
            location: formData.location
          },
        } : null,
      }

      const response = await axios.post("/api/auth/register", registrationData)

      if (response.data.success) {
        setCurrentStep(3)
        toast.success("Account created successfully!")
      } else {
        toast.error(response.data.error || "Failed to create account")
        setCurrentStep(1) // Go back to form
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to create account"
      toast.error(errorMessage)
      console.error("Registration error:", error)
      setCurrentStep(1) // Go back to form
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.role === "receiver" && formData.receiverType === "ngo") {
      if (!formData.ngoName || !formData.registrationNo || !formData.areasServed || !formData.capacity) {
        toast.error("Please fill in all NGO details")
        return
      }
    }

    if (formData.role === "donor") {
      if (!formData.organizationName || !formData.location || !formData.operatingHours) {
        toast.error("Please fill in all organization details")
        return
      }
    }

    await sendOTP()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ResQMeal
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStep === 1 && "Sign Up for ResQMeal"}
            {currentStep === 2 && "Verify Your Email"}
            {currentStep === 3 && "Welcome to ResQMeal!"}
          </h1>
          <p className="text-gray-600">
            {currentStep === 1 && "Join our community and start making a difference"}
            {currentStep === 2 && "Enter the OTP sent to your email address"}
            {currentStep === 3 && "Your account has been created successfully"}
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          {/* Step 1: Registration Form */}
          {currentStep === 1 && (
            <>
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-center text-gray-900">Create Your Account</CardTitle>
                <CardDescription className="text-center text-gray-600">Fill in your details to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-emerald-600" />
                        Personal Information
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Enter your basic details to get started</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Lock className="h-4 w-4" />
                          Password *
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="h-12"
                          required
                        />
                        <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Selection Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Choose Your Role</h3>
                      <p className="text-sm text-gray-600 mt-1">Select how you'll be using ResQMeal</p>
                    </div>

                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => handleInputChange("role", value)}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <div className="flex items-start space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer">
                          <RadioGroupItem value="donor" id="donor" className="text-emerald-600 mt-1" />
                          <Label htmlFor="donor" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Food Donor</div>
                                <div className="text-sm text-gray-600">I have surplus food to share</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 ml-13">
                              Perfect for restaurants, canteens, hostels, and organizations with excess food
                            </p>
                          </Label>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="flex items-start space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer">
                          <RadioGroupItem value="receiver" id="receiver" className="text-emerald-600 mt-1" />
                          <Label htmlFor="receiver" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <User className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Food Receiver</div>
                                <div className="text-sm text-gray-600">I want to receive surplus food</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 ml-13">
                              For individuals, NGOs, and organizations that help distribute food to those in need
                            </p>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Conditional Fields for Food Receiver */}
                  {formData.role === "receiver" && (
                    <div className="space-y-6">
                      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                        <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Receiver Details
                        </h4>

                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-emerald-800">What type of receiver are you?</Label>
                          <RadioGroup
                            value={formData.receiverType}
                            onValueChange={(value) => handleInputChange("receiverType", value)}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-emerald-200">
                              <RadioGroupItem value="ngo" id="ngo" className="text-emerald-600" />
                              <Label htmlFor="ngo" className="cursor-pointer flex-1">
                                <div className="font-medium text-gray-900">NGO / Organization</div>
                                <div className="text-sm text-gray-600">Registered organization that distributes food</div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-emerald-200">
                              <RadioGroupItem value="individual" id="individual" className="text-emerald-600" />
                              <Label htmlFor="individual" className="cursor-pointer flex-1">
                                <div className="font-medium text-gray-900">Individual in Need</div>
                                <div className="text-sm text-gray-600">Person seeking food assistance</div>
                              </Label>
                            </div>
                          </RadioGroup>

                          {/* NGO Details */}
                          {formData.receiverType === "ngo" && (
                            <div className="space-y-6 mt-6 p-6 bg-white rounded-lg border border-emerald-200">
                              <div className="flex items-center gap-2 mb-4">
                                <Building className="h-5 w-5 text-emerald-600" />
                                <h5 className="font-semibold text-gray-900">NGO Information</h5>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="ngoName" className="text-sm font-medium text-gray-700">
                                    NGO Name *
                                  </Label>
                                  <Input
                                    id="ngoName"
                                    type="text"
                                    placeholder="Enter NGO name"
                                    value={formData.ngoName}
                                    onChange={(e) => handleInputChange("ngoName", e.target.value)}
                                    className="h-12"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="registrationNo" className="text-sm font-medium text-gray-700">
                                    Registration Number *
                                  </Label>
                                  <Input
                                    id="registrationNo"
                                    type="text"
                                    placeholder="Enter registration number"
                                    value={formData.registrationNo}
                                    onChange={(e) => handleInputChange("registrationNo", e.target.value)}
                                    className="h-12"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                                  Website
                                </Label>
                                <Input
                                  id="website"
                                  type="text"
                                  placeholder="Enter NGO website (optional)"
                                  value={formData.website}
                                  onChange={(e) => handleInputChange("website", e.target.value)}
                                  className="h-12"
                                />
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="areasServed" className="text-sm font-medium text-gray-700">
                                    Areas Served *
                                  </Label>
                                  <Input
                                    id="areasServed"
                                    type="text"
                                    placeholder="e.g., Downtown, Central District"
                                    value={formData.areasServed}
                                    onChange={(e) => handleInputChange("areasServed", e.target.value)}
                                    className="h-12"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                                    Daily Capacity (people) *
                                  </Label>
                                  <Input
                                    id="capacity"
                                    type="number"
                                    placeholder="Number of people served daily"
                                    value={formData.capacity}
                                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                                    className="h-12"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conditional Fields for Food Donor */}
                  {formData.role === "donor" && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                        <h4 className="font-semibold text-blue-900 mb-6 flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Organization Details
                        </h4>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                Organization Name *
                              </Label>
                              <Input
                                id="organizationName"
                                type="text"
                                placeholder="e.g., Main Campus Canteen"
                                value={formData.organizationName}
                                onChange={(e) => handleInputChange("organizationName", e.target.value)}
                                className="h-12"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                Primary Location *
                              </Label>
                              <Input
                                id="location"
                                type="text"
                                placeholder="e.g., Building A, Ground Floor"
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                                className="h-12"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="operatingHours" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Operating Hours *
                            </Label>
                            <Input
                              id="operatingHours"
                              type="text"
                              placeholder="e.g., Monday-Friday: 9:00 AM - 6:00 PM"
                              value={formData.operatingHours}
                              onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                              className="h-12"
                              required
                            />
                            <p className="text-sm text-gray-500">
                              Specify when surplus food is typically available
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isLoading || !formData.role}
                      className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending OTP...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Send Verification Code
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 text-center mt-4">
                      We'll send a verification code to your email address
                    </p>
                  </div>
                </form>

                {/* Sign In Link */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <>
              <CardHeader className="pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center text-gray-900">Verify Your Email</CardTitle>
                <CardDescription className="text-center text-gray-600 max-w-md mx-auto">
                  We've sent a 6-digit verification code to <br />
                  <strong className="text-emerald-600">{formData.email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 text-center block">
                      Enter Verification Code
                    </Label>
                    <div className="flex justify-center">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-48 h-16 text-center text-2xl font-mono tracking-[0.5rem] border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                        maxLength={6}
                      />
                    </div>

                    {otpTimer > 0 && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-amber-700 font-medium">
                            Code expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={verifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying Code...
                      </div>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </Button>

                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">Didn't receive the code?</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={sendOTP}
                        disabled={otpTimer > 0 || isLoading}
                        className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        Resend Code
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setCurrentStep(1)}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        ← Back to Form
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <>
              <CardHeader className="pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center text-gray-900">Account Created Successfully!</CardTitle>
                <CardDescription className="text-center text-gray-600 max-w-md mx-auto">
                  Welcome to ResQMeal! Your account has been created and verified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8 text-center">
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                      You're now part of the ResQMeal community!
                    </h3>
                    <p className="text-emerald-700">
                      Start {formData.role === "donor" ? "sharing surplus food" : "discovering available food"} in your area and make a difference in fighting food waste.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Link href="/login">
                      <Button className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] group">
                        <div className="flex items-center gap-2">
                          Sign In to Your Account
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Button>
                    </Link>

                    <p className="text-sm text-gray-500">
                      Use your email and password to sign in and start using ResQMeal
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
