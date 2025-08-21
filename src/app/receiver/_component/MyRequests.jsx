'use client';

import React, { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Phone,
    MessageCircle,
    MapPin,
    Star,
    Package,
    AlertTriangle,
    RefreshCw,
    Copy,
    Navigation,
    User,
    Calendar,
    Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MyRequests = ({ getStatusBadge }) => {
    const [activeTab, setActiveTab] = useState("all");
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    // Mock data
    useEffect(() => {
        setTimeout(() => {
            const mockRequests = [
                {
                    id: 1,
                    listingTitle: "Fresh Bread & Pastries",
                    provider: "Artisan Bakery",
                    providerRating: 4.8,
                    requestedAt: "2024-01-15T14:30:00Z",
                    status: "confirmed",
                    pickupTime: "2024-01-15T16:00:00Z",
                    pickupLocation: "Main Street, Shop 45",
                    otp: "1234",
                    requestedQuantity: "5 items",
                    providerPhone: "+1234567890",
                    notes: "Please call when you arrive",
                    expiresAt: "2024-01-15T18:00:00Z",
                    distance: "0.8 km",
                    category: "bakery"
                },
                {
                    id: 2,
                    listingTitle: "Surplus Vegetables",
                    provider: "Farm Market",
                    providerRating: 4.5,
                    requestedAt: "2024-01-14T10:15:00Z",
                    status: "pending",
                    pickupTime: "Pending confirmation",
                    pickupLocation: "Downtown Market, Stall 12",
                    otp: null,
                    requestedQuantity: "3 kg",
                    providerPhone: "+1234567891",
                    notes: "Need vegetables for community kitchen",
                    expiresAt: "2024-01-14T20:00:00Z",
                    distance: "1.2 km",
                    category: "vegetables"
                },
                {
                    id: 3,
                    listingTitle: "University Canteen Meals",
                    provider: "University Canteen",
                    providerRating: 4.3,
                    requestedAt: "2024-01-13T12:00:00Z",
                    status: "completed",
                    pickupTime: "2024-01-13T14:00:00Z",
                    pickupLocation: "Campus Area, Building A",
                    otp: "5678",
                    requestedQuantity: "10 portions",
                    providerPhone: "+1234567892",
                    notes: "Collected successfully",
                    expiresAt: "2024-01-13T18:00:00Z",
                    distance: "2.1 km",
                    category: "cooked_meals",
                    rating: 5,
                    feedback: "Excellent food quality and quick response!"
                },
                {
                    id: 4,
                    listingTitle: "Dairy Products",
                    provider: "City Dairy Farm",
                    providerRating: 4.9,
                    requestedAt: "2024-01-12T09:30:00Z",
                    status: "cancelled",
                    pickupTime: "2024-01-12T15:00:00Z",
                    pickupLocation: "Farm Road, Sector 7",
                    otp: null,
                    requestedQuantity: "2 kg",
                    providerPhone: "+1234567893",
                    notes: "Provider had to cancel due to quality concerns",
                    expiresAt: "2024-01-13T09:30:00Z",
                    distance: "3.5 km",
                    category: "dairy"
                },
                {
                    id: 5,
                    listingTitle: "Restaurant Surplus",
                    provider: "Downtown Restaurant",
                    providerRating: 4.6,
                    requestedAt: "2024-01-11T19:00:00Z",
                    status: "expired",
                    pickupTime: "2024-01-11T21:00:00Z",
                    pickupLocation: "Food Court, Level 2",
                    otp: "9012",
                    requestedQuantity: "8 portions",
                    providerPhone: "+1234567894",
                    notes: "Could not pickup on time",
                    expiresAt: "2024-01-11T22:00:00Z",
                    distance: "1.8 km",
                    category: "cooked_meals"
                }
            ];

            setRequests(mockRequests);
            setFilteredRequests(mockRequests);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter requests based on active tab and search
    useEffect(() => {
        let filtered = [...requests];

        // Filter by tab
        if (activeTab !== "all") {
            filtered = filtered.filter(request => request.status === activeTab);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(request =>
                request.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.provider.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredRequests(filtered);
    }, [requests, activeTab, searchQuery]);

    const tabs = [
        { id: "all", label: "All Requests", count: requests.length },
        { id: "pending", label: "Pending", count: requests.filter(r => r.status === "pending").length },
        { id: "confirmed", label: "Confirmed", count: requests.filter(r => r.status === "confirmed").length },
        { id: "completed", label: "Completed", count: requests.filter(r => r.status === "completed").length },
        { id: "cancelled", label: "Cancelled", count: requests.filter(r => r.status === "cancelled").length }
    ];

    const handleCopyOTP = (otp) => {
        navigator.clipboard.writeText(otp);
        toast.success('OTP copied to clipboard!');
    };

    const handleSubmitRating = () => {
        // Submit rating and feedback
        toast.success('Rating submitted successfully!');
        setShowRatingModal(false);
        setRating(0);
        setFeedback("");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "confirmed":
                return "text-green-600 bg-green-50 border-green-200";
            case "completed":
                return "text-blue-600 bg-blue-50 border-blue-200";
            case "cancelled":
                return "text-red-600 bg-red-50 border-red-200";
            case "expired":
                return "text-gray-600 bg-gray-50 border-gray-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const isUrgent = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const hoursLeft = (expiry - now) / (1000 * 60 * 60);
        return hoursLeft <= 2 && hoursLeft > 0;
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading your requests...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
                    <p className="text-gray-600">Track and manage your food requests</p>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search by food item or provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex flex-wrap border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                                        : "border-transparent text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                                }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs">
                                        {tab.count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.map((request) => (
                    <Card key={request.id} className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
                        isUrgent(request.expiresAt) && request.status === 'confirmed' ? 'border-l-4 border-orange-500' : 'border-l-4 border-emerald-500'
                    }`}>
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                {/* Main Content */}
                                <div className="flex-1 space-y-4">
                                    {/* Title and Status */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.listingTitle}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`px-2 py-1 text-xs border ${getStatusColor(request.status)}`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </Badge>
                                                {isUrgent(request.expiresAt) && request.status === 'confirmed' && (
                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-2 py-1 text-xs">
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        Urgent Pickup
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Provider Info */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{request.provider}</p>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                <span className="text-sm text-gray-600">{request.providerRating}</span>
                                                <span className="text-gray-400 mx-1">•</span>
                                                <span className="text-sm text-gray-600">{request.distance}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Request Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-600" />
                                                <span className="text-gray-600">Quantity:</span>
                                                <span className="font-medium">{request.requestedQuantity}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-600" />
                                                <span className="text-gray-600">Requested:</span>
                                                <span className="font-medium">{formatDate(request.requestedAt)}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-600" />
                                                <span className="text-gray-600">Pickup:</span>
                                                <span className="font-medium">
                                                    {typeof request.pickupTime === 'string' && request.pickupTime.includes('Pending') 
                                                        ? request.pickupTime 
                                                        : formatDate(request.pickupTime)
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-600" />
                                                <span className="text-gray-600">Location:</span>
                                                <span className="font-medium text-xs">{request.pickupLocation}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* OTP Section */}
                                    {request.otp && request.status === 'confirmed' && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-green-800">Pickup OTP</p>
                                                    <p className="text-lg font-bold text-green-900">{request.otp}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCopyOTP(request.otp)}
                                                    className="text-green-700 border-green-300 hover:bg-green-100"
                                                >
                                                    <Copy className="w-4 h-4 mr-1" />
                                                    Copy
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {request.notes && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Notes:</strong> {request.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Rating & Feedback (for completed requests) */}
                                    {request.status === 'completed' && request.rating && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-yellow-800">Your Rating:</span>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${
                                                                star <= request.rating
                                                                    ? 'text-yellow-500 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {request.feedback && (
                                                <p className="text-sm text-yellow-800">{request.feedback}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 lg:w-48">
                                    {request.status === 'confirmed' && (
                                        <>
                                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call Provider
                                            </Button>
                                            <Button variant="outline">
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                Message
                                            </Button>
                                            <Button variant="outline">
                                                <Navigation className="w-4 h-4 mr-2" />
                                                Get Directions
                                            </Button>
                                        </>
                                    )}
                                    
                                    {request.status === 'completed' && !request.rating && (
                                        <Button 
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowRatingModal(true);
                                            }}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                        >
                                            <Star className="w-4 h-4 mr-2" />
                                            Rate Experience
                                        </Button>
                                    )}

                                    <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {filteredRequests.length === 0 && (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
                        <p className="text-gray-600 mb-4">
                            {activeTab === "all" 
                                ? "You haven't made any food requests yet."
                                : `No ${activeTab} requests found.`
                            }
                        </p>
                        <Button onClick={() => setActiveTab("all")} variant="outline">
                            {activeTab === "all" ? "Browse Available Food" : "View All Requests"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Rate Your Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Rating</Label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${
                                                    star <= rating
                                                        ? 'text-yellow-500 fill-current'
                                                        : 'text-gray-300 hover:text-yellow-400'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">
                                    Feedback (Optional)
                                </Label>
                                <textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSubmitRating}
                                    disabled={rating === 0}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Submit Rating
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setRating(0);
                                        setFeedback("");
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyRequests;
