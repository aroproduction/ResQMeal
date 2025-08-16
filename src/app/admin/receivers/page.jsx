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
    Users,
    Mail,
    Phone,
    Heart,
    User,
    Building2,
    Eye
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ReceiversManagement() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [receivers, setReceivers] = useState([])
    const [ngos, setNgos] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("ALL") // ALL, INDIVIDUAL, NGO

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/login")
        }
    }, [session, status, router])

    useEffect(() => {
        fetchData()
    }, [session])

    const fetchData = async () => {
        try {
            const [receiversResponse, ngosResponse] = await Promise.all([
                axios.get("/api/admin/receivers"),
                axios.get("/api/admin/ngos")
            ])

            setReceivers(receiversResponse.data)
            setNgos(ngosResponse.data)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const filteredReceivers = receivers.filter(receiver => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = (
            receiver.name.toLowerCase().includes(searchLower) ||
            receiver.email.toLowerCase().includes(searchLower) ||
            (receiver.profile?.department && receiver.profile.department.toLowerCase().includes(searchLower))
        )

        const matchesFilter = (
            filterType === "ALL" ||
            (filterType === "INDIVIDUAL" && receiver.role === "RECEIVER") ||
            (filterType === "NGO" && receiver.role === "NGO")
        )

        return matchesSearch && matchesFilter
    })

    const individualReceivers = receivers.filter(r => r.role === "RECEIVER")
    const ngoReceivers = receivers.filter(r => r.role === "NGO")

    if (status === "loading" || loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-gray-600">Loading receivers...</p>
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
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
                                    <h1 className="text-3xl font-bold text-gray-900">Food Receivers</h1>
                                    <p className="text-gray-600">Manage individual receivers and NGO organizations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Total Receivers</p>
                                        <p className="text-3xl font-bold text-green-900">{receivers.length}</p>
                                    </div>
                                    <Users className="h-12 w-12 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Individual Users</p>
                                        <p className="text-3xl font-bold text-blue-900">{individualReceivers.length}</p>
                                    </div>
                                    <User className="h-12 w-12 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-600 text-sm font-medium">NGO Organizations</p>
                                        <p className="text-3xl font-bold text-red-900">{ngoReceivers.length}</p>
                                    </div>
                                    <Heart className="h-12 w-12 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, email, or department..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {["ALL", "INDIVIDUAL", "NGO"].map((type) => (
                                    <Button
                                        key={type}
                                        variant={filterType === type ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterType(type)}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* NGO Organizations Section */}
                    {(filterType === "ALL" || filterType === "NGO") && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <Heart className="h-6 w-6 mr-2 text-red-500" />
                                NGO Organizations
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {ngos.map((ngo) => (
                                    <Card key={ngo.id} className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-red-400">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg text-gray-900">{ngo.ngoName}</CardTitle>
                                                    <CardDescription>Contact: {ngo.user.name}</CardDescription>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        ngo.verificationStatus === "VERIFIED"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : ngo.verificationStatus === "PENDING"
                                                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                                : "bg-red-50 text-red-700 border-red-200"
                                                    }
                                                >
                                                    {ngo.verificationStatus}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {ngo.user.email}
                                            </div>
                                            {ngo.user.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {ngo.user.phone}
                                                </div>
                                            )}
                                            {ngo.capacity && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Capacity: {ngo.capacity} people/day
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">
                                                Registered: {new Date(ngo.user.createdAt).toLocaleDateString()}
                                            </div>
                                            <Link href={`/admin/ngos/${ngo.id}`}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View NGO & Members
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Individual Receivers Section */}
                    {(filterType === "ALL" || filterType === "INDIVIDUAL") && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <User className="h-6 w-6 mr-2 text-blue-500" />
                                Individual Receivers
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredReceivers
                                    .filter(receiver => receiver.role === "RECEIVER")
                                    .map((receiver) => (
                                        <Card key={receiver.id} className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-blue-400">
                                            <CardHeader>
                                                <CardTitle className="text-lg text-gray-900">{receiver.name}</CardTitle>
                                                <CardDescription>Individual Food Receiver</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    {receiver.email}
                                                </div>
                                                {receiver.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        {receiver.phone}
                                                    </div>
                                                )}
                                                {receiver.profile?.department && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Building2 className="h-4 w-4 mr-2" />
                                                        {receiver.profile.department}
                                                    </div>
                                                )}
                                                {receiver.profile?.studentId && (
                                                    <div className="text-sm text-gray-600">
                                                        Student ID: {receiver.profile.studentId}
                                                    </div>
                                                )}
                                                {receiver.profile?.employeeId && (
                                                    <div className="text-sm text-gray-600">
                                                        Employee ID: {receiver.profile.employeeId}
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">
                                                            Joined: {new Date(receiver.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {receiver._count.claims} claims
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    )}

                    {filteredReceivers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No receivers found</h3>
                            <p className="text-gray-600">
                                {searchTerm || filterType !== "ALL"
                                    ? "Try adjusting your search or filter criteria."
                                    : "No food receivers have registered yet."
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
