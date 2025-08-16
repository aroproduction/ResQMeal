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
    Globe,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Mail,
    Phone
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NGOManagement() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [ngos, setNgos] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/login")
        }
    }, [session, status, router])

    useEffect(() => {
        fetchNGOs()
    }, [session])

    const fetchNGOs = async () => {
        try {
            const response = await axios.get("/api/admin/ngos")
            setNgos(response.data)
        } catch (error) {
            console.error("Error fetching NGOs:", error)
            toast.error("Failed to load NGOs")
        } finally {
            setLoading(false)
        }
    }

    const handleVerification = async (ngoId, status) => {
        try {
            const response = await axios.patch(`/api/admin/ngos/${ngoId}/verify`, {
                status
            })

            toast.success(`NGO ${status === "VERIFIED" ? "verified" : "rejected"} successfully`)
            fetchNGOs() // Refresh the list
        } catch (error) {
            console.error("Error updating NGO:", error)
            toast.error("Failed to update NGO status")
        }
    }

    const filteredNGOs = ngos.filter(ngo => {
        const matchesSearch = ngo.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ngo.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ngo.user.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterStatus === "ALL" || ngo.verificationStatus === filterStatus

        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status) => {
        switch (status) {
            case "VERIFIED":
                return "bg-green-100 text-green-800 border-green-200"
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200"
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "VERIFIED":
                return <CheckCircle className="h-4 w-4" />
            case "REJECTED":
                return <XCircle className="h-4 w-4" />
            case "PENDING":
                return <Clock className="h-4 w-4" />
            default:
                return null
        }
    }

    if (status === "loading" || loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-gray-600">Loading NGOs...</p>
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
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
                                    <h1 className="text-3xl font-bold text-gray-900">NGO Management</h1>
                                    <p className="text-gray-600">Verify and manage NGO registrations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by NGO name, contact person, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((status) => (
                                    <Button
                                        key={status}
                                        variant={filterStatus === status ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* NGO Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNGOs.map((ngo) => (
                            <Card key={ngo.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl text-gray-900">{ngo.ngoName}</CardTitle>
                                            <CardDescription>
                                                Contact: {ngo.user.name}
                                            </CardDescription>
                                        </div>
                                        <Badge className={`${getStatusColor(ngo.verificationStatus)} flex items-center gap-1`}>
                                            {getStatusIcon(ngo.verificationStatus)}
                                            {ngo.verificationStatus}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        {ngo.website && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Globe className="h-4 w-4 mr-2" />
                                                <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {ngo.website}
                                                </a>
                                            </div>
                                        )}
                                        {ngo.registrationNo && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Building2 className="h-4 w-4 mr-2" />
                                                Reg: {ngo.registrationNo}
                                            </div>
                                        )}
                                    </div>

                                    {ngo.description && (
                                        <div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{ngo.description}</p>
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

                                    {ngo.verificationStatus === "PENDING" && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleVerification(ngo.id, "VERIFIED")}
                                                className="bg-green-600 hover:bg-green-700 flex-1"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Verify
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleVerification(ngo.id, "REJECTED")}
                                                className="flex-1"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}

                                    <Link href={`/admin/ngos/${ngo.id}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details & Members
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredNGOs.length === 0 && (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No NGOs found</h3>
                            <p className="text-gray-600">
                                {searchTerm || filterStatus !== "ALL"
                                    ? "Try adjusting your search or filter criteria."
                                    : "No NGOs have registered yet."
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
