'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const UserProtectedRoute = ({ children }) => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === 'loading') return

        // Allow public routes without any checks
        const publicRoutes = ['/', '/login', '/register']
        if (publicRoutes.includes(pathname)) {
            return
        }

        // If not authenticated, redirect to login
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        // If authenticated, check role-based access
        if (session?.user) {
            const userRole = session.user.role

            // Role-based route protection
            if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
                router.push('/unauthorized')
                return
            }

            if (pathname.startsWith('/provider') && userRole !== 'PROVIDER') {
                router.push('/unauthorized')
                return
            }

            if (pathname.startsWith('/receiver') && userRole !== 'RECEIVER') {
                router.push('/unauthorized')
                return
            }
        }
    }, [status, session, pathname, router])

    // Show loading spinner while checking authentication
    if (status === 'loading') {
        return (
            <div className="flex flex-col space-y-2 items-center justify-center min-h-screen bg-purple-50/35">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
                <p className="text-gray-700 text-lg mt-4">Loading...</p>
            </div>
        )
    }

    // Allow public routes to render without authentication
    const publicRoutes = ['/', '/login', '/register']
    if (publicRoutes.includes(pathname)) {
        return <>{children}</>
    }

    // If not authenticated and trying to access protected route, show loading
    // (useEffect will handle the redirect)
    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col space-y-2 items-center justify-center min-h-screen bg-purple-50/35">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
                <p className="text-gray-700 text-lg mt-4">Redirecting to login...</p>
            </div>
        )
    }

    // If authenticated but role check is happening, show loading
    if (session?.user) {
        const userRole = session.user.role

        // Check if user is trying to access unauthorized route
        if (
            (pathname.startsWith('/admin') && userRole !== 'ADMIN') ||
            (pathname.startsWith('/provider') && userRole !== 'PROVIDER') ||
            (pathname.startsWith('/receiver') && userRole !== 'RECEIVER')
        ) {
            return (
                <div className="flex flex-col space-y-2 items-center justify-center min-h-screen bg-purple-50/35">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
                    <p className="text-gray-700 text-lg mt-4">Checking permissions...</p>
                </div>
            )
        }
    }

    // If all checks pass, render children
    return <>{children}</>
}

export default UserProtectedRoute
