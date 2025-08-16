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
    ArrowLeft,
    Building2,
    Globe,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Phone,
    MapPin,
    Calendar,
    UserCheck
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NGODetails({ params }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [ngoDetails, setNgoDetails] = useState(null)
    const [ngoMembers, setNgoMembers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/login")
        }
    }, [session, status, router])

    useEffect(() => {
        if (params.id) {
            fetchNGODetails()
        }
    }, [params.id, session])

    const fetchNGODetails = async () => {
        try {
            const [ngoResponse, membersResponse] = await Promise.all([
                axios.get(`/api/admin/ngos/${params.id}`),
                axios.get(`/api/admin/ngos/${params.id}/members`)
            ])

            setNgoDetails(ngoResponse.data)
            setNgoMembers(membersResponse.data)
        } catch (error) {
            console.error("Error fetching NGO details:", error)
            toast.error("Failed to load NGO details")
        } finally {
            setLoading(false)
        }
    }

    const handleVerification = async (status) => {
        try {
            await axios.patch(`/api/admin/ngos/${params.id}/verify`, {
                status
            })

            toast.success(`NGO ${status === "VERIFIED" ? "verified" : "rejected"} successfully`)
            fetchNGODetails() // Refresh the details
        } catch (error) {
            console.error("Error updating NGO:", error)
            toast.error("Failed to update NGO status")
        }
    }

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
                        <p className="text-gray-600">Loading NGO details...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (session?.user?.role !== "ADMIN" || !ngoDetails) {
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
                                <Link href="/admin/ngos">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to NGOs
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{ngoDetails.ngoName}</h1>
                                    <p className="text-gray-600">NGO Details and Members</p>
                                </div>
                            </div>
                            <Badge className={`${getStatusColor(ngoDetails.verificationStatus)} flex items-center gap-1 text-lg px-3 py-1`}>
                                {getStatusIcon(ngoDetails.verificationStatus)}
                                {ngoDetails.verificationStatus}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* NGO Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building2 className="h-6 w-6 mr-2 text-red-500" />
                                        NGO Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">NGO Name</label>
                                            <p className="text-lg font-semibold">{ngoDetails.ngoName}</p>
                                        </div>

                                        {ngoDetails.registrationNo && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Registration Number</label>
                                                <p className="text-lg">{ngoDetails.registrationNo}</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Contact Person</label>
                                            <p className="text-lg">{ngoDetails.user.name}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-lg">{ngoDetails.user.email}</p>
                                        </div>

                                        {ngoDetails.user.phone && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                                <p className="text-lg">{ngoDetails.user.phone}</p>
                                            </div>
                                        )}

                                        {ngoDetails.website && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Website</label>
                                                <a href={ngoDetails.website} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 hover:underline">
                                                    {ngoDetails.website}
                                                </a>
                                            </div>
                                        )}

                                        {ngoDetails.capacity && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Daily Capacity</label>
                                                <p className="text-lg">{ngoDetails.capacity} people</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Registered Date</label>
                                            <p className="text-lg">{new Date(ngoDetails.user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {ngoDetails.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Description</label>
                                            <p className="text-gray-800 mt-1">{ngoDetails.description}</p>
                                        </div>
                                    )}

                                    {ngoDetails.servingAreas && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Serving Areas</label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {ngoDetails.servingAreas.map((area, index) => (
                                                    <Badge key={index} variant="outline" className="flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {ngoDetails.verificationStatus === "PENDING" && (
                                        <div className="flex gap-4 pt-4 border-t">
                                            <Button
                                                onClick={() => handleVerification("VERIFIED")}
                                                className="bg-green-600 hover:bg-green-700 flex-1"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Verify NGO
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleVerification("REJECTED")}
                                                className="flex-1"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject NGO
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* NGO Members */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Users className="h-6 w-6 mr-2 text-blue-500" />
                                            NGO Members ({ngoMembers.length})
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        Users registered under this NGO organization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {ngoMembers.length > 0 ? (
                                        <div className="space-y-4">
                                            {ngoMembers.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <UserCheck className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{member.name}</p>
                                                            <p className="text-sm text-gray-600">{member.email}</p>
                                                            {member.phone && (
                                                                <p className="text-sm text-gray-600">{member.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="outline">
                                                            {member.role}
                                                        </Badge>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Joined: {new Date(member.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                                            <p className="text-gray-600">No users have registered under this NGO.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Verification Info Sidebar */}
                        <div className="space-y-6">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-lg">Verification Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <Badge className={`${getStatusColor(ngoDetails.verificationStatus)} text-lg px-4 py-2`}>
                                            {getStatusIcon(ngoDetails.verificationStatus)}
                                            <span className="ml-2">{ngoDetails.verificationStatus}</span>
                                        </Badge>
                                    </div>

                                    {ngoDetails.verifiedAt && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Verified Date</label>
                                            <p className="text-sm">{new Date(ngoDetails.verifiedAt).toLocaleString()}</p>
                                        </div>
                                    )}

                                    {ngoDetails.verifiedBy && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Verified By</label>
                                            <p className="text-sm">Admin ID: {ngoDetails.verifiedBy}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Members:</span>
                                        <span className="font-semibold">{ngoMembers.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Registration Date:</span>
                                        <span className="font-semibold">{new Date(ngoDetails.user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {ngoDetails.capacity && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Daily Capacity:</span>
                                            <span className="font-semibold">{ngoDetails.capacity}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
