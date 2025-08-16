"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/AdminLayout"
import axios from "axios"
import {
    Users,
    UserCheck,
    Building2,
    Heart,
    AlertCircle,
    CheckCircle,
    Clock,
    Eye
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingNGOs: 0,
        verifiedNGOs: 0,
        providers: 0,
        receivers: 0,
        individualReceivers: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/login")
        }
    }, [session, status, router])

    useEffect(() => {
        // Fetch dashboard stats
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/admin/stats")
                setStats(response.data)
            } catch (error) {
                console.error("Error fetching stats:", error)
                toast.error("Failed to load dashboard statistics")
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.role === "ADMIN") {
            fetchStats()
        }
    }, [session])

    if (status === "loading" || loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (session?.user?.role !== "ADMIN") {
        return null
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-gray-600">Manage users and oversee platform operations</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Total Users</p>
                                        <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
                                    </div>
                                    <Users className="h-12 w-12 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 text-sm font-medium">Pending NGOs</p>
                                        <p className="text-3xl font-bold text-orange-900">{stats.pendingNGOs}</p>
                                    </div>
                                    <Clock className="h-12 w-12 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Verified NGOs</p>
                                        <p className="text-3xl font-bold text-green-900">{stats.verifiedNGOs}</p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-600 text-sm font-medium">Providers</p>
                                        <p className="text-3xl font-bold text-purple-900">{stats.providers}</p>
                                    </div>
                                    <Building2 className="h-12 w-12 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* NGO Management */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Heart className="h-6 w-6 mr-2 text-red-500" />
                                    NGO Management
                                </CardTitle>
                                <CardDescription>
                                    Verify NGO registrations and manage NGO accounts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                                        <span className="font-medium">Pending Verifications</span>
                                    </div>
                                    <Badge variant="destructive">{stats.pendingNGOs}</Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="font-medium">Verified NGOs</span>
                                    </div>
                                    <Badge variant="outline">{stats.verifiedNGOs}</Badge>
                                </div>

                                <Link href="/admin/ngos">
                                    <Button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Manage NGOs
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* User Management */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-6 w-6 mr-2 text-blue-500" />
                                    User Management
                                </CardTitle>
                                <CardDescription>
                                    View and manage providers and receivers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center">
                                        <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                                        <span className="font-medium">Food Providers</span>
                                    </div>
                                    <Badge variant="outline">{stats.providers}</Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="font-medium">Food Receivers</span>
                                    </div>
                                    <Badge variant="outline">{stats.receivers}</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/admin/providers">
                                        <Button variant="outline" className="w-full">
                                            View Providers
                                        </Button>
                                    </Link>
                                    <Link href="/admin/receivers">
                                        <Button variant="outline" className="w-full">
                                            View Receivers
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
