import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    ClipboardList,
    Search,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Eye,
    Shield,
    Package,
    MessageCircle,
    Star,
    Filter,
    ChevronDown,
    AlertTriangle,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ManageClaims = () => {
    const [activeTab, setActiveTab] = useState("incoming");
    const [searchQuery, setSearchQuery] = useState("");
    const [emailSearchQuery, setEmailSearchQuery] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [verifiedClaim, setVerifiedClaim] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [completing, setCompleting] = useState(false);

    // Fetch claims from backend
    useEffect(() => {
        fetchClaims();
    }, [activeTab]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            let statusParam = null;

            if (activeTab === "incoming") {
                statusParam = "pending";
            } else if (activeTab === "active") {
                statusParam = "confirmed";
            } else if (activeTab === "completed") {
                statusParam = "completed";
            }

            const response = await axios.get('/api/provider/claims', {
                params: statusParam ? { status: statusParam } : {}
            });

            if (response.data.success) {
                setClaims(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            toast.error('Failed to fetch claims');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-orange-100 text-orange-700 border-orange-200";
            case "approved":
            case "confirmed":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "completed":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "rejected":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case "high":
                return "bg-red-100 text-red-700 border-red-200";
            case "medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-700 border-green-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleSearch = async (email) => {
        try {
            const response = await axios.get('/api/provider/claims/search', {
                params: { email }
            });

            if (response.data.success) {
                const foundClaim = response.data.data;
                setSelectedClaim(foundClaim);
                setShowOtpModal(true);
                toast.success('Claim found! Please enter the pickup code.');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error('No active claim found for this email');
            } else {
                toast.error('Failed to search for claim');
            }
        }
    };

    const handleOtpVerification = async () => {
        if (!selectedClaim || !otpInput) {
            toast.error('Please enter the pickup code');
            return;
        }

        try {
            setVerifying(true);
            const response = await axios.post('/api/provider/claims/verify', {
                claimId: selectedClaim.id,
                code: otpInput
            });

            if (response.data.success) {
                setVerifiedClaim(selectedClaim);
                setShowOtpModal(false);
                setShowDetailsModal(true);
                setOtpInput("");
                toast.success('Pickup code verified successfully!');
                fetchClaims(); // Refresh claims
            }
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error('Invalid pickup code');
            } else {
                toast.error('Failed to verify pickup code');
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleCompleteDelivery = async (claimId) => {
        try {
            setCompleting(true);
            const response = await axios.post('/api/provider/claims/complete', {
                claimId
            });

            if (response.data.success) {
                toast.success('Delivery completed successfully!');
                fetchClaims(); // Refresh claims
                if (showDetailsModal) {
                    setShowDetailsModal(false);
                }
            }
        } catch (error) {
            console.error('Error completing delivery:', error);
            toast.error(error.response?.data?.error || 'Failed to complete delivery');
        } finally {
            setCompleting(false);
        }
    };

    const handleVerifyFromCard = (claim) => {
        setSelectedClaim(claim);
        setShowOtpModal(true);
    };

    const filteredClaims = claims.filter(claim => {
        const statusMatch = statusFilter === "all" || claim.status === statusFilter;
        const searchMatch = claim.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.receiverEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (claim.foodItems && claim.foodItems.some(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        return statusMatch && searchMatch;
    });

    const getTabCounts = () => {
        return {
            incoming: claims.filter(c => c.status === "pending").length,
            active: claims.filter(c => c.status === "confirmed" || c.status === "approved").length,
            completed: claims.filter(c => c.status === "completed").length
        };
    };

    const tabCounts = getTabCounts();

    return (
        <div className="space-y-6 p-6 lg:p-8">
            {/* Header */}
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-3xl overflow-hidden">
                <CardHeader className="p-8">
                    <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <ClipboardList className="w-8 h-8 text-white" />
                        </div>
                        Manage Claims
                        <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                            {claims.filter(c => c.status !== "completed").length} Active
                        </Badge>
                    </CardTitle>
                    <p className="text-emerald-50 text-lg mt-2">
                        Track and manage food pickup requests from receivers
                    </p>
                </CardHeader>
            </Card>

            {/* Quick Search & OTP Verification */}
            <Card className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="p-6 border-b border-gray-100">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        Quick Verification
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                Search Receiver by Email
                            </Label>
                            <div className="flex gap-3">
                                <Input
                                    type="email"
                                    placeholder="Enter receiver's email address"
                                    value={emailSearchQuery}
                                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                                    className="h-12 rounded-xl flex-1"
                                />
                                <Button
                                    onClick={() => handleSearch(emailSearchQuery)}
                                    disabled={!emailSearchQuery}
                                    className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-1 bg-blue-500 rounded-full mt-1">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-800 mb-1">How it works</h4>
                                    <p className="text-sm text-blue-700">
                                        Search for the receiver by email, verify their OTP, and confirm food pickup completion.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Tabs */}
            <Card className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "incoming", label: "Incoming Requests", count: tabCounts.incoming },
                                { key: "active", label: "Active Claims", count: tabCounts.active },
                                { key: "completed", label: "Completed", count: tabCounts.completed }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === tab.key
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key
                                            ? 'bg-emerald-200 text-emerald-800'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading claims...</h3>
                                <p className="text-gray-500">Please wait while we fetch your claims.</p>
                            </div>
                        ) : filteredClaims.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
                                <p className="text-gray-500">No claims match your current filters.</p>
                            </div>
                        ) : (
                            filteredClaims.map((claim) => (
                                <ClaimCard
                                    key={claim.id}
                                    claim={claim}
                                    onComplete={handleCompleteDelivery}
                                    onVerify={() => handleVerifyFromCard(claim)}
                                />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* OTP Verification Modal */}
            {showOtpModal && selectedClaim && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-gray-100">
                            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-600" />
                                Verify Receiver
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{selectedClaim.receiverName}</h3>
                                <p className="text-sm text-gray-600">{selectedClaim.receiverEmail}</p>
                                <p className="text-sm text-emerald-600 font-medium">
                                    {selectedClaim.foodItems.length} food item(s) requested
                                </p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Enter OTP provided by receiver
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Enter 4-digit OTP"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    className="h-12 rounded-xl text-center text-lg font-mono tracking-widest"
                                    maxLength="4"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowOtpModal(false);
                                        setOtpInput("");
                                        setSelectedClaim(null);
                                    }}
                                    className="flex-1 h-12 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleOtpVerification}
                                    disabled={!otpInput || verifying}
                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {verifying ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify Code'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Food Details Modal - Shows after OTP verification */}
            {showDetailsModal && verifiedClaim && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <CardHeader className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <CardTitle className="text-xl text-gray-900 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    Food Items for {verifiedClaim.receiverName}
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700">
                                    OTP Verified
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{verifiedClaim.receiverEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{verifiedClaim.receiverPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{verifiedClaim.distance} away</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Requested Food Items:</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-200 rounded-xl">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Food Item</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {verifiedClaim.foodItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-gray-900">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={getStatusColor(item.status)}>
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.status === "verified" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleCompleteDelivery(verifiedClaim.id, item.id)}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            >
                                                                Mark as Given
                                                            </Button>
                                                        )}
                                                        {item.status === "completed" && (
                                                            <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Given
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setVerifiedClaim(null);
                                    }}
                                    className="px-6 h-12 rounded-xl"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => handleCompleteDelivery(verifiedClaim.id)}
                                    disabled={completing}
                                    className="px-6 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {completing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Completing...
                                        </>
                                    ) : (
                                        'Complete All Items'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Individual Claim Card Component
const ClaimCard = ({ claim, onComplete, onVerify }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-orange-100 text-orange-700 border-orange-200";
            case "approved":
            case "confirmed":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "completed":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case "high":
                return "bg-red-100 text-red-700 border-red-200";
            case "medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-700 border-green-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const totalItems = claim.foodItems?.length || 1;
    const completedItems = claim.foodItems?.filter(item => item.status === "completed").length || 0;

    return (
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {claim.receiverName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{claim.receiverName}</h3>
                        <p className="text-sm text-gray-600">{claim.receiverEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{claim.claimTime}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(claim.urgency)}>
                        {claim.urgency} priority
                    </Badge>
                    <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                        {totalItems} food item{totalItems > 1 ? 's' : ''}
                        {claim.status === "completed" && ` (${completedItems}/${totalItems} given)`}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{claim.distance} away</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                        {claim.status === "completed" ? `Completed ${claim.completedTime}` : `ETA: ${claim.estimatedArrival}`}
                    </span>
                </div>
            </div>

            {/* Food Items Preview */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {claim.foodItems && claim.foodItems.length > 0 ? (
                        <>
                            {claim.foodItems.slice(0, 3).map((item, index) => (
                                <span
                                    key={item.id || index}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                >
                                    {item.name} ({item.quantity || claim.requestedQuantity})
                                </span>
                            ))}
                            {claim.foodItems.length > 3 && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                    +{claim.foodItems.length - 3} more
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {claim.listingTitle} ({claim.requestedQuantity})
                        </span>
                    )}
                </div>
            </div>

            {showDetails && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="ml-2 text-gray-600">{claim.receiverPhone}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Claim ID:</span>
                            <span className="ml-2 text-gray-600 font-mono">{claim.id}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 mb-2">Requested Items:</h4>
                        {claim.foodItems && claim.foodItems.length > 0 ? (
                            claim.foodItems.map((item, index) => (
                                <div key={item.id || index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                        <span className="text-sm text-gray-600">({item.quantity || claim.requestedQuantity})</span>
                                    </div>
                                    <Badge className={getStatusColor(item.status || claim.status)} size="sm">
                                        {item.status || claim.status}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">{claim.listingTitle}</span>
                                    <span className="text-sm text-gray-600">({claim.requestedQuantity})</span>
                                </div>
                                <Badge className={getStatusColor(claim.status)} size="sm">
                                    {claim.status}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    {showDetails ? 'Hide' : 'Show'} Details
                </Button>

                <div className="flex items-center gap-2">
                    {claim.status === "pending" && (
                        <Button
                            size="sm"
                            onClick={onVerify}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Verify OTP
                        </Button>
                    )}
                    {(claim.status === "confirmed" || claim.status === "approved") && (
                        <Button
                            size="sm"
                            onClick={() => onComplete(claim.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Complete Delivery
                        </Button>
                    )}
                    {claim.status === "completed" && (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Completed</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageClaims;
