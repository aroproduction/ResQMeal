'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    MapPin,
    Package,
    Users,
    AlertTriangle,
    Calendar,
    CheckCircle,
    XCircle,
    Edit,
    Save,
    X
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// View Listing Modal
export const ViewListingModal = ({ isOpen, onClose, listingId }) => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && listingId) {
            fetchListingDetails();
        }
    }, [isOpen, listingId]);

    const fetchListingDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/provider/listings/${listingId}`);
            if (response.data.success) {
                setListing(response.data.listing);
            }
        } catch (error) {
            toast.error('Failed to load listing details');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-100 text-green-700';
            case 'PARTIALLY_CLAIMED':
                return 'bg-yellow-100 text-yellow-700';
            case 'FULLY_CLAIMED':
                return 'bg-blue-100 text-blue-700';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-700';
            case 'EXPIRED':
                return 'bg-red-100 text-red-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-red-100 text-red-700';
            case 'HIGH':
                return 'bg-orange-100 text-orange-700';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-700';
            case 'LOW':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-emerald-600" />
                        Listing Details
                    </DialogTitle>
                    <DialogDescription>
                        Complete information about this food listing
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <span className="ml-2">Loading listing details...</span>
                    </div>
                ) : listing ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                                {listing.description && (
                                    <p className="text-gray-600 mt-1">{listing.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Badge className={getStatusColor(listing.status)}>
                                    {listing.status.replace('_', ' ')}
                                </Badge>
                                <Badge className={getPriorityColor(listing.priority)}>
                                    {listing.priority}
                                </Badge>
                            </div>
                        </div>

                        {/* Food Items */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Food Items
                            </Label>
                            <div className="space-y-2">
                                {listing.foodItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-gray-600">{item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Total: {listing.totalQuantity} {listing.unit}
                            </div>
                        </div>

                        {/* Timing Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Safe Until
                                </Label>
                                <p className="text-gray-900">{formatDateTime(listing.safeUntil)}</p>
                                {new Date(listing.safeUntil) <= new Date() && (
                                    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                                        <AlertTriangle className="w-4 h-4" />
                                        Expired
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Available Until
                                </Label>
                                <p className="text-gray-900">{formatDateTime(listing.availableUntil)}</p>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2">Freshness Level</Label>
                                <Badge variant="outline" className="text-sm">
                                    {listing.freshness.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2">Claims</Label>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>{listing.claims?.length || 0} claims</span>
                                </div>
                            </div>
                        </div>

                        {/* Pickup Instructions */}
                        {listing.pickupInstructions && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Pickup Instructions
                                </Label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {listing.pickupInstructions}
                                </p>
                            </div>
                        )}

                        {/* Allergens and Dietary Info */}
                        {(listing.allergens?.length > 0 || listing.dietaryInfo?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {listing.allergens?.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2">Allergens</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {listing.allergens.map((allergen, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {allergen}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {listing.dietaryInfo?.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2">Dietary Information</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {listing.dietaryInfo.map((info, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {info}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Claims Details */}
                        {listing.claims?.length > 0 && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2">Claims</Label>
                                <div className="space-y-2">
                                    {listing.claims.map((claim) => (
                                        <div key={claim.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <div>
                                                <span className="font-medium">{claim.receiver.name}</span>
                                                <span className="text-gray-600 ml-2">({claim.receiver.email})</span>
                                            </div>
                                            <Badge variant="outline">
                                                {claim.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Failed to load listing details
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Edit Listing Modal
export const EditListingModal = ({ isOpen, onClose, listingId, onUpdate }) => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pickupInstructions: '',
        status: 'AVAILABLE'
    });

    useEffect(() => {
        if (isOpen && listingId) {
            fetchListingDetails();
        }
    }, [isOpen, listingId]);

    const fetchListingDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/provider/listings/${listingId}`);
            if (response.data.success) {
                const listing = response.data.listing;
                setListing(listing);
                setFormData({
                    title: listing.title,
                    description: listing.description || '',
                    pickupInstructions: listing.pickupInstructions || '',
                    status: listing.status
                });
            }
        } catch (error) {
            toast.error('Failed to load listing details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(`/api/provider/listings/${listingId}`, formData);
            if (response.data.success) {
                toast.success('Listing updated successfully');
                onUpdate?.();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    const statusOptions = [
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'PARTIALLY_CLAIMED', label: 'Partially Claimed' },
        { value: 'FULLY_CLAIMED', label: 'Fully Claimed' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5 text-blue-600" />
                        Edit Listing
                    </DialogTitle>
                    <DialogDescription>
                        Update listing information
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading listing details...</span>
                    </div>
                ) : listing ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter listing title"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter listing description"
                                className="w-full p-2 border border-gray-300 rounded-md resize-none h-20"
                            />
                        </div>

                        <div>
                            <Label htmlFor="pickupInstructions">Pickup Instructions</Label>
                            <textarea
                                id="pickupInstructions"
                                value={formData.pickupInstructions}
                                onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                                placeholder="Enter pickup instructions"
                                className="w-full p-2 border border-gray-300 rounded-md resize-none h-20"
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Read-only information */}
                        <div className="border-t pt-4">
                            <Label className="text-sm text-gray-600 mb-2">Food Items (Read-only)</Label>
                            <div className="space-y-1">
                                {listing.foodItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                        <span>{item.name}</span>
                                        <span>{item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Failed to load listing details
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Delete Listing Modal
export const DeleteListingModal = ({ isOpen, onClose, listingId, listingTitle, onDelete }) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const response = await axios.delete(`/api/provider/listings/${listingId}`);
            if (response.data.success) {
                toast.success('Listing deleted successfully');
                onDelete?.();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete listing');
        } finally {
            setDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Delete Listing
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete the listing <strong>"{listingTitle}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        This will permanently remove the listing and all associated claims.
                    </p>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="destructive"
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Delete Listing
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
