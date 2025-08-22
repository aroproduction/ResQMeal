'use client';

import React, { useState, useEffect } from "react";
import {
    Heart,
    Clock,
    MapPin,
    Star,
    Package,
    Users,
    Leaf,
    RefreshCw,
    AlertTriangle,
    Search,
    Eye,
    Phone,
    MessageCircle,
    Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const Dashboard = ({ setActiveSection, getStatusBadge }) => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalRequests: 0,
        mealsReceived: 0,
        nearbyDonations: 0,
        rating: 0,
        organizationName: "Receiver"
    });
    const [availableListings, setAvailableListings] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard metrics
            const metricsResponse = await fetch('/api/receiver/dashboard/metrics');
            if (metricsResponse.ok) {
                const metricsData = await metricsResponse.json();
                setMetrics(metricsData.data);
            }

            // Fetch recent available listings
            const listingsResponse = await fetch('/api/receiver/dashboard/recent-listings?limit=3');
            if (listingsResponse.ok) {
                const listingsData = await listingsResponse.json();
                const formattedListings = listingsData.data.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    provider: listing.provider.displayName,
                    distance: "Calculating...", // You can calculate distance based on coordinates
                    freshness: listing.freshness,
                    quantity: `${listing.remainingQuantity} ${listing.unit}`,
                    expiresIn: `${listing.timeRemaining} hours`,
                    status: listing.priority === 'URGENT' ? 'urgent' : 'available',
                    location: listing.location.name,
                    phone: listing.provider.phone
                }));
                setAvailableListings(formattedListings);
            }

            // Fetch active claims
            const claimsResponse = await fetch('/api/receiver/dashboard/active-claims?limit=3');
            if (claimsResponse.ok) {
                const claimsData = await claimsResponse.json();
                const formattedRequests = claimsData.data.map(claim => ({
                    id: claim.id,
                    listingTitle: claim.listing.title,
                    provider: claim.listing.provider.displayName,
                    requestedAt: claim.timeAgo,
                    status: claim.status.toLowerCase(),
                    pickupTime: claim.pickupTime ? new Date(claim.pickupTime).toLocaleString() : 'Pending',
                    otp: claim.pickupCode || 'Pending'
                }));
                setMyRequests(formattedRequests);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const refreshDashboard = async () => {
        setRefreshing(true);
        try {
            await fetchDashboardData();
            toast.success('Dashboard refreshed');
        } catch (error) {
            toast.error('Failed to refresh dashboard');
        } finally {
            setRefreshing(false);
        }
    };

    const handleRequestFood = async (listingId) => {
        try {
            // For dashboard quick request, we'll use a default quantity of 1
            // In a real app, you might want to open a modal to get the quantity
            const response = await fetch(`/api/receiver/listings/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestedQuantity: 1,
                    notes: 'Quick request from dashboard'
                })
            });

            if (response.ok) {
                toast.success('Food request sent successfully!');
                // Refresh dashboard data to update counts
                await fetchDashboardData();
                // Optionally redirect to requests page
                setActiveSection("requests");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Error requesting food:', error);
            toast.error('Failed to send request');
        }
    };

    const getFreshnessColor = (freshness) => {
        switch (freshness) {
            case "FRESHLY_COOKED":
                return "text-green-600 bg-green-50 border-green-200";
            case "FRESH":
                return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "GOOD":
                return "text-blue-600 bg-blue-50 border-blue-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {metrics.organizationName}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Discover and request food donations in your area
                    </p>
                </div>
                <Button 
                    onClick={refreshDashboard}
                    variant="outline"
                    disabled={refreshing}
                    className="self-start lg:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Total Requests</CardTitle>
                        <Heart className="h-5 w-5 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{metrics.totalRequests}</div>
                        <p className="text-xs text-emerald-700 mt-1">+3 this month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Meals Received</CardTitle>
                        <Package className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{metrics.mealsReceived}</div>
                        <p className="text-xs text-blue-700 mt-1">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">Nearby Donations</CardTitle>
                        <MapPin className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-900">{metrics.nearbyDonations}</div>
                        <p className="text-xs text-orange-700 mt-1">Available now</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Rating</CardTitle>
                        <Star className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-900">{metrics.rating}/5</div>
                        <p className="text-xs text-purple-700 mt-1">Community rating</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                            onClick={() => setActiveSection("browse")}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-12"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Browse Available Food
                        </Button>
                        <Button 
                            onClick={() => setActiveSection("requests")}
                            variant="outline" 
                            className="h-12"
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            View My Requests
                        </Button>
                        <Button 
                            onClick={() => setActiveSection("map")}
                            variant="outline" 
                            className="h-12"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Map View
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Available Listings */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Available Food Nearby
                    </CardTitle>
                    <Button 
                        onClick={() => setActiveSection("browse")}
                        variant="outline" 
                        size="sm"
                    >
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {availableListings.slice(0, 3).map((listing) => (
                            <div key={listing.id} className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                                            {getStatusBadge(listing.status)}
                                            <Badge className={`px-2 py-1 text-xs border ${getFreshnessColor(listing.freshness)}`}>
                                                {listing.freshness.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <strong>Provider:</strong> {listing.provider}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <strong>Quantity:</strong> {listing.quantity}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {listing.distance} • {listing.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Expires in {listing.expiresIn}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button 
                                            onClick={() => handleRequestFood(listing.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            size="sm"
                                        >
                                            <Heart className="w-4 h-4 mr-1" />
                                            Request
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Navigation className="w-4 h-4 mr-1" />
                                            Map
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Requests
                    </CardTitle>
                    <Button 
                        onClick={() => setActiveSection("requests")}
                        variant="outline" 
                        size="sm"
                    >
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {myRequests.map((request) => (
                            <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{request.listingTitle}</h3>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <strong>Provider:</strong> {request.provider}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <strong>Pickup:</strong> {request.pickupTime}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Requested {request.requestedAt}
                                        </p>
                                        {request.otp && (
                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                                <p className="text-sm text-green-800">
                                                    <strong>OTP:</strong> {request.otp}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {request.status === "confirmed" && (
                                            <>
                                                <Button variant="outline" size="sm">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    Message
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    Call
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
