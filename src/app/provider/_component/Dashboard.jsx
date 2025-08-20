'use client';

import React, { useState, useEffect } from "react";
import {
    Package,
    Clock,
    CheckCircle,
    Eye,
    Edit,
    Trash2,
    Upload,
    Users,
    Leaf,
    Star,
    RefreshCw,
    AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ViewListingModal, EditListingModal, DeleteListingModal } from "./ListingModals";
import axios from "axios";
import { toast } from "sonner";

const Dashboard = ({ setActiveSection, getStatusBadge }) => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        activeListings: 0,
        peopleServed: 0,
        co2Reduced: "0kg",
        rating: 0,
        businessName: "Provider"
    });
    const [activeListings, setActiveListings] = useState([]);
    const [pastListings, setPastListings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Modal states
    const [viewModal, setViewModal] = useState({ open: false, listingId: null });
    const [editModal, setEditModal] = useState({ open: false, listingId: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, listingId: null, title: '' });

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [metricsResponse, activeResponse, pastResponse] = await Promise.all([
                axios.get('/api/provider/dashboard/metrics'),
                axios.get('/api/provider/dashboard/active-listings'),
                axios.get('/api/provider/dashboard/past-listings')
            ]);

            if (metricsResponse.data.success) {
                setMetrics(metricsResponse.data.data);
                console.log(metricsResponse.data.data);
            }
            if (activeResponse.data.success) {
                setActiveListings(activeResponse.data.data);
            }
            if (pastResponse.data.success) {
                setPastListings(pastResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Refresh dashboard data
    const refreshDashboard = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
        toast.success('Dashboard refreshed');
    };

    // Handle listing actions
    const handleDeleteListing = async (listingId) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        try {
            await axios.delete(`/api/provider/dashboard/listings/${listingId}`);
            toast.success('Listing deleted successfully');
            // Refresh data
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete listing');
        }
    };

    const handleUpdateListingStatus = async (listingId, newStatus) => {
        try {
            await axios.patch(`/api/provider/dashboard/listings/${listingId}`, { status: newStatus });
            toast.success('Listing status updated');
            // Refresh data
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update listing status');
        }
    };

    // Modal handlers
    const openViewModal = (listingId) => {
        setViewModal({ open: true, listingId });
    };

    const openEditModal = (listingId) => {
        setEditModal({ open: true, listingId });
    };

    const openDeleteModal = (listingId, title) => {
        setDeleteModal({ open: true, listingId, title });
    };

    const closeModals = () => {
        setViewModal({ open: false, listingId: null });
        setEditModal({ open: false, listingId: null });
        setDeleteModal({ open: false, listingId: null, title: '' });
    };

    const handleModalUpdate = () => {
        fetchDashboardData();
        closeModals();
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Prepare metrics array for display
    const metricsArray = [
        {
            title: "Active Listings",
            value: metrics.activeListings,
            icon: Package,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            title: "People Served",
            value: metrics.peopleServed,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "CO₂ Reduced",
            value: metrics.co2Reduced,
            icon: Leaf,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Rating",
            value: metrics.rating > 0 ? metrics.rating.toFixed(1) : "N/A",
            icon: Star,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            extraInfo: metrics.ratingDetails || null
        },
    ];

    if (loading) {
        return (
            <div className="space-y-8 p-6 lg:p-8">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="ml-2 text-lg">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-3">
                                Good afternoon, {metrics.businessName}!
                            </h2>
                            <p className="font-body text-white/90 text-lg lg:text-xl mb-2">
                                You're making a real difference in your community
                            </p>
                        </div>
                        <Button
                            onClick={refreshDashboard}
                            disabled={refreshing}
                            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Button
                            onClick={() => setActiveSection("add-listing")}
                            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm font-body px-6 py-3 rounded-xl"
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Quick Add Listing
                        </Button>
                    </div>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full"></div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {metricsArray.map((metric, index) => {
                    const Icon = metric.icon;
                    const isRatingCard = metric.title === "Rating";
                    return (
                        <Card key={index} className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                            <CardContent className="p-6 lg:p-8">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${metric.bgColor}`}>
                                        <Icon className={`w-8 h-8 ${metric.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-body text-gray-600 text-sm mb-1">{metric.title}</p>
                                        <p className="font-heading text-3xl font-bold text-gray-900">{metric.value}</p>
                                        {isRatingCard && metric.extraInfo && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs text-gray-500">
                                                    {metric.extraInfo.totalReviews} reviews
                                                </p>
                                                {metric.extraInfo.averageFoodQuality > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        Food Quality: {metric.extraInfo.averageFoodQuality.toFixed(1)}/5
                                                    </p>
                                                )}
                                                {metric.extraInfo.averageExperience > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        Experience: {metric.extraInfo.averageExperience.toFixed(1)}/5
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Feedback Section */}
            {metrics.ratingDetails && metrics.ratingDetails.recentComments && metrics.ratingDetails.recentComments.length > 0 && (
                <Card className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-200/20 p-8">
                        <CardTitle className="font-heading text-2xl text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                            Recent Feedback
                            <Badge className="bg-yellow-100 text-yellow-700 ml-auto">
                                {metrics.ratingDetails.totalReviews} Total Reviews
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {metrics.ratingDetails.recentComments.map((feedback, index) => (
                                <div key={index} className="border-l-4 border-yellow-200 pl-4 py-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(feedback.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm italic">"{feedback.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Listings */}
            <Card className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-200/20 p-8">
                    <CardTitle className="font-heading text-2xl text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Package className="w-6 h-6 text-emerald-600" />
                        </div>
                        Active Listings
                        <Badge className="bg-emerald-100 text-emerald-700 ml-auto">
                            {activeListings.length} Active
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {activeListings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No active listings</p>
                            <p className="text-sm">Create your first listing to start sharing food!</p>
                            <Button
                                onClick={() => setActiveSection("add-listing")}
                                className="mt-4"
                            >
                                Create Listing
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200/20">
                                        <TableHead className="font-body font-semibold px-8">Food Name</TableHead>
                                        <TableHead className="font-body font-semibold">Expiry</TableHead>
                                        <TableHead className="font-body font-semibold">Status</TableHead>
                                        <TableHead className="font-body font-semibold">Claims</TableHead>
                                        <TableHead className="font-body font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeListings.map((listing) => (
                                        <TableRow key={listing.id} className="hover:bg-emerald-50/30 transition-colors border-gray-200/20">
                                            <TableCell className="font-body font-medium px-8">{listing.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className={`font-body ${listing.isExpired ? 'text-red-600 font-semibold' : ''}`}>
                                                        {listing.expiry}
                                                    </span>
                                                    {(listing.status === 'urgent' || listing.isExpired) && (
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    )}
                                                    {listing.isExpired && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            EXPIRED
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(listing.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm font-body font-medium">
                                                        {listing.claims} claims
                                                    </span>
                                                    {listing.claimedQuantity > 0 && (
                                                        <span className="text-xs text-gray-600">
                                                            {listing.claimedQuantity.toFixed(1)}/{listing.totalQuantity} {listing.unit || 'units'}
                                                        </span>
                                                    )}
                                                    {listing.isExpired && listing.wastedQuantity > 0 && (
                                                        <span className="text-xs text-red-600">
                                                            {listing.wastedQuantity.toFixed(1)} wasted
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 hover:bg-emerald-50 hover:border-emerald-300"
                                                        title="View details"
                                                        onClick={() => openViewModal(listing.id)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                                                        title="Edit listing"
                                                        onClick={() => openEditModal(listing.id)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 text-red-600"
                                                        onClick={() => openDeleteModal(listing.id, listing.name)}
                                                        title="Delete listing"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Past Listings */}
            <Card className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-200/20 p-8">
                    <CardTitle className="font-heading text-2xl text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        Past Listings
                        <Badge className="bg-blue-100 text-blue-700 ml-auto">
                            {pastListings.length} Completed
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {pastListings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No completed listings yet</p>
                            <p className="text-sm">Your completed food donations will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200/20">
                                        <TableHead className="font-body font-semibold px-8">Food Name</TableHead>
                                        <TableHead className="font-body font-semibold">Quantity</TableHead>
                                        <TableHead className="font-body font-semibold">Completed</TableHead>
                                        <TableHead className="font-body font-semibold">Recipient</TableHead>
                                        <TableHead className="font-body font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastListings.map((listing) => (
                                        <TableRow key={listing.id} className="hover:bg-blue-50/30 transition-colors border-gray-200/20">
                                            <TableCell className="px-8">
                                                <div>
                                                    <div className="font-body font-medium text-gray-900">{listing.name}</div>
                                                    <div className="font-body text-sm text-gray-500">{listing.category}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-body">{listing.quantity}</TableCell>
                                            <TableCell className="font-body text-gray-700">{listing.completedDate}</TableCell>
                                            <TableCell className="font-body text-gray-700">{listing.recipient}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                                                    title="View details"
                                                    onClick={() => openViewModal(listing.id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            <ViewListingModal
                isOpen={viewModal.open}
                onClose={closeModals}
                listingId={viewModal.listingId}
            />
            <EditListingModal
                isOpen={editModal.open}
                onClose={closeModals}
                listingId={editModal.listingId}
                onUpdate={handleModalUpdate}
            />
            <DeleteListingModal
                isOpen={deleteModal.open}
                onClose={closeModals}
                listingId={deleteModal.listingId}
                listingTitle={deleteModal.title}
                onDelete={handleModalUpdate}
            />
        </div>
    );
};

export default Dashboard;
