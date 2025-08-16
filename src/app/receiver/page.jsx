"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, LogOut, MapPin, Clock, Heart } from "lucide-react"
import Link from "next/link"

export default function ReceiverPage() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                        <Leaf className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                ResQMeal
                            </span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {session?.user?.name}</span>
                            <Button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Receiver Dashboard</h1>
                    <p className="text-gray-600">Find and request food donations in your area</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                            <Heart className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">12</div>
                            <p className="text-xs text-gray-600">+3 this month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Meals Received</CardTitle>
                            <Clock className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">48</div>
                            <p className="text-xs text-gray-600">Last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Nearby Donations</CardTitle>
                            <MapPin className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">8</div>
                            <p className="text-xs text-gray-600">Available now</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                                Browse Available Food
                            </Button>
                            <Button variant="outline" className="w-full">
                                View My Requests
                            </Button>
                            <Button variant="outline" className="w-full">
                                Request History
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900">Available Donations Nearby</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-900">University Canteen</h4>
                                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Available</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Fresh meals, vegetarian options</p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>0.5 km away</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-900">Local Restaurant</h4>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Available</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Surplus from lunch service</p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>1.2 km away</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
