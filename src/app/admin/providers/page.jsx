"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import AdminLayout from "@/components/AdminLayout"
import axios from "axios"
import {
    ArrowLeft,
    Search,
    Building2,
    Mail,
    Phone,
    MapPin,
    Clock,
    Users,
    Package
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ProvidersManagement() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [providers, setProviders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/login")
        }
    }, [session, status, router])

    useEffect(() => {
        fetchProviders()
    }, [session])

    const fetchProviders = async () => {
        try {
            const response = await axios.get("/api/admin/providers")
            setProviders(response.data)
        } catch (error) {
            console.error("Error fetching providers:", error)
            toast.error("Failed to load providers")
        } finally {
            setLoading(false)
        }
    }

    const filteredProviders = providers.filter(provider => {
        const searchLower = searchTerm.toLowerCase()
        return (
            provider.name.toLowerCase().includes(searchLower) ||
            provider.email.toLowerCase().includes(searchLower) ||
            (provider.providerDetails?.businessName &&
                provider.providerDetails.businessName.toLowerCase().includes(searchLower))
        )
    })

    if (status === "loading" || loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-gray-600">Loading providers...</p>
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Dashboard
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Food Providers</h1>
                                    <p className="text-gray-600">Manage food providers and canteen managers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, or business name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Providers Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProviders.map((provider) => (
                            <Card key={provider.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg text-gray-900">{provider.name}</CardTitle>
                                            <CardDescription>
                                                {provider.providerDetails?.businessName || "Individual Provider"}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                            {provider.role}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Mail className="h-4 w-4 mr-2" />
                                            {provider.email}
                                        </div>
                                        {provider.phone && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="h-4 w-4 mr-2" />
                                                {provider.phone}
                                            </div>
                                        )}
                                        {provider.providerDetails?.licenseNo && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Package className="h-4 w-4 mr-2" />
                                                License: {provider.providerDetails.licenseNo}
                                            </div>
                                        )}
                                        {provider.providerDetails?.capacity && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                Capacity: {provider.providerDetails.capacity}/day
                                            </div>
                                        )}
                                        {provider.providerDetails?.location?.name && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {provider.providerDetails.location.name}
                                            </div>
                                        )}
                                    </div>

                                    {provider.providerDetails?.operatingHours && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Operating Hours</label>
                                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                                <Clock className="h-4 w-4 mr-2" />
                                                <span>Check details for schedule</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">
                                                Joined: {new Date(provider.createdAt).toLocaleDateString()}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {provider._count.listings} listings
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button variant="outline" size="sm" className="w-full">
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredProviders.length === 0 && (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                            <p className="text-gray-600">
                                {searchTerm
                                    ? "Try adjusting your search criteria."
                                    : "No food providers have registered yet."
                                }
                            </p>
                        </div>
                    )}

                    {/* Stats Summary */}
                    {providers.length > 0 && (
                        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Provider Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">{providers.length}</p>
                                    <p className="text-sm text-gray-600">Total Providers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {providers.filter(p => p.role === "CANTEEN_MANAGER").length}
                                    </p>
                                    <p className="text-sm text-gray-600">Canteen Managers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {providers.reduce((sum, p) => sum + p._count.listings, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Listings</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
