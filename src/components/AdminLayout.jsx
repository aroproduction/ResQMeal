"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Leaf,
    LogOut,
    UserCheck
} from "lucide-react"
import Link from "next/link"

export default function AdminLayout({ children }) {
    const { data: session } = useSession()

    if (!session || session.user.role !== "ADMIN") {
        return children
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/admin" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Leaf className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                ResQMeal Admin
                            </span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="px-3 py-1">
                                <UserCheck className="h-4 w-4 mr-1" />
                                Administrator
                            </Badge>
                            <span className="text-gray-600">Welcome, {session.user.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {children}
        </div>
    )
}
