"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, LogOut, Users, Package, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ProviderPage() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
                    <p className="text-gray-600">Manage your food donations and make a difference in your community</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
                            <Package className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">24</div>
                            <p className="text-xs text-gray-600">+12% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">People Helped</CardTitle>
                            <Users className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">156</div>
                            <p className="text-xs text-gray-600">+8% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Impact Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">92</div>
                            <p className="text-xs text-gray-600">+5% from last month</p>
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
                                Create New Donation
                            </Button>
                            <Button variant="outline" className="w-full">
                                View My Donations
                            </Button>
                            <Button variant="outline" className="w-full">
                                Donation History
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">New donation request from NGO ABC</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Donation completed successfully</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Profile updated</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
