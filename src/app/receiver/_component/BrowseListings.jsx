'use client';

import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    MapPin,
    Clock,
    Heart,
    Eye,
    Navigation,
    Star,
    Phone,
    MessageCircle,
    Package,
    User,
    AlertTriangle,
    RefreshCw,
    SlidersHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BrowseListings = ({ getStatusBadge }) => {
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
        distance: "all",
        freshness: "all",
        category: "all",
        availability: "all"
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("distance");
    const [selectedListing, setSelectedListing] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Fetch listings from API
    const fetchListings = async () => {
        try {
            setLoading(true);
            
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append('search', searchQuery);
            if (selectedFilters.freshness !== 'all') queryParams.append('freshness', selectedFilters.freshness);
            if (selectedFilters.locationId !== 'all') queryParams.append('locationId', selectedFilters.locationId);
            queryParams.append('sortBy', sortBy);
            queryParams.append('order', 'desc');

            const response = await fetch(`/api/receiver/listings?${queryParams.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                const formattedListings = data.data.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    description: listing.description,
                    provider: listing.provider.displayName,
                    providerRating: 4.5, // You can add provider ratings to the database later
                    distance: 1.0, // Calculate based on coordinates later
                    location: listing.location.name,
                    freshness: listing.freshness,
                    category: "general", // You can add categories to the database later
                    quantity: `${listing.remainingQuantity} ${listing.unit}`,
                    expiresIn: `${listing.timeRemaining} hours`,
                    status: listing.priority === 'URGENT' ? 'urgent' : 'available',
                    photos: listing.photos || [],
                    phone: listing.provider.phone,
                    allergens: listing.allergens || [],
                    dietaryInfo: listing.dietaryInfo || [],
                    pickupInstructions: listing.pickupInstructions,
                    originalListing: listing // Keep reference to original data
                }));
                
                setListings(formattedListings);
                setFilteredListings(formattedListings);
            } else {
                console.error('Failed to fetch listings');
                toast.error('Failed to load listings');
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [searchQuery, selectedFilters, sortBy]);

    // Filter and search logic
    useEffect(() => {
        let filtered = [...listings];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(listing => 
                listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Distance filter
        if (selectedFilters.distance !== "all") {
            const maxDistance = parseFloat(selectedFilters.distance);
            filtered = filtered.filter(listing => listing.distance <= maxDistance);
        }

        // Freshness filter
        if (selectedFilters.freshness !== "all") {
            filtered = filtered.filter(listing => listing.freshness === selectedFilters.freshness);
        }

        // Category filter
        if (selectedFilters.category !== "all") {
            filtered = filtered.filter(listing => listing.category === selectedFilters.category);
        }

        // Availability filter
        if (selectedFilters.availability !== "all") {
            filtered = filtered.filter(listing => listing.status === selectedFilters.availability);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "distance":
                    return a.distance - b.distance;
                case "expiry":
                    return parseFloat(a.expiresIn) - parseFloat(b.expiresIn);
                case "rating":
                    return b.providerRating - a.providerRating;
                default:
                    return 0;
            }
        });

        setFilteredListings(filtered);
    }, [listings, searchQuery, selectedFilters, sortBy]);

    const handleRequestFood = async (listingId) => {
        try {
            // For browse listings, we'll use a default quantity of 1
            // In a real app, you might want to open a modal to get the quantity
            const response = await fetch(`/api/receiver/listings/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestedQuantity: 1,
                    notes: 'Request from browse listings'
                })
            });

            if (response.ok) {
                toast.success('Food request sent successfully!');
                // Refresh listings to update availability
                await fetchListings();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Error requesting food:', error);
            toast.error('Failed to send request');
        }
    };

    const handleViewDetails = (listing) => {
        setSelectedListing(listing);
        setShowDetailsModal(true);
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

    const getUrgencyColor = (expiresIn) => {
        const hours = parseFloat(expiresIn);
        if (hours <= 2) return "text-red-600";
        if (hours <= 4) return "text-orange-600";
        return "text-gray-600";
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading available food...</p>
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
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Browse Available Food</h1>
                    <p className="text-gray-600">Discover food donations in your area</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="distance">Sort by Distance</option>
                        <option value="expiry">Sort by Expiry</option>
                        <option value="rating">Sort by Rating</option>
                    </select>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search for food items, providers, or descriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Distance</Label>
                                <select 
                                    value={selectedFilters.distance}
                                    onChange={(e) => setSelectedFilters({...selectedFilters, distance: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All distances</option>
                                    <option value="1">Within 1 km</option>
                                    <option value="2">Within 2 km</option>
                                    <option value="5">Within 5 km</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Freshness</Label>
                                <select 
                                    value={selectedFilters.freshness}
                                    onChange={(e) => setSelectedFilters({...selectedFilters, freshness: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All freshness levels</option>
                                    <option value="FRESHLY_COOKED">Freshly Cooked</option>
                                    <option value="FRESH">Fresh</option>
                                    <option value="GOOD">Good</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Category</Label>
                                <select 
                                    value={selectedFilters.category}
                                    onChange={(e) => setSelectedFilters({...selectedFilters, category: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All categories</option>
                                    <option value="vegetables">Vegetables</option>
                                    <option value="fruits">Fruits</option>
                                    <option value="bakery">Bakery</option>
                                    <option value="dairy">Dairy</option>
                                    <option value="cooked_meals">Cooked Meals</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Availability</Label>
                                <select 
                                    value={selectedFilters.availability}
                                    onChange={(e) => setSelectedFilters({...selectedFilters, availability: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All listings</option>
                                    <option value="available">Available</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
                </p>
                {(searchQuery || Object.values(selectedFilters).some(filter => filter !== "all")) && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedFilters({
                                distance: "all",
                                freshness: "all",
                                category: "all",
                                availability: "all"
                            });
                        }}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                    <Card key={listing.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-lg text-gray-900 mb-2">{listing.title}</CardTitle>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(listing.status)}
                                        <Badge className={`px-2 py-1 text-xs border ${getFreshnessColor(listing.freshness)}`}>
                                            {listing.freshness.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Distance</p>
                                    <p className="font-semibold text-emerald-600">{listing.distance} km</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700 text-sm">{listing.description}</p>
                            
                            {/* Provider Info */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">{listing.provider}</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-xs text-gray-600">{listing.providerRating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-600">Quantity</p>
                                    <p className="font-medium text-gray-900">{listing.quantity}</p>
                                </div>
                            </div>

                            {/* Location & Time */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{listing.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-600" />
                                    <span className={`${getUrgencyColor(listing.expiresIn)} font-medium`}>
                                        Expires in {listing.expiresIn}
                                    </span>
                                    {parseFloat(listing.expiresIn) <= 2 && (
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            </div>

                            {/* Dietary Info */}
                            <div className="flex flex-wrap gap-1">
                                {listing.dietaryInfo.map((info, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {info}
                                    </Badge>
                                ))}
                            </div>

                            {/* Pickup Instructions */}
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                <strong>Pickup:</strong> {listing.pickupInstructions}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button 
                                    onClick={() => handleRequestFood(listing.id)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Request Food
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handleViewDetails(listing)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Phone className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {filteredListings.length === 0 && (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No food listings found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or check back later for new listings.
                        </p>
                        <Button 
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedFilters({
                                    distance: "all",
                                    freshness: "all",
                                    category: "all",
                                    availability: "all"
                                });
                            }}
                            variant="outline"
                        >
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedListing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Listing Details</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Main Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedListing.title}</h3>
                                        <p className="text-gray-600 mt-2">{selectedListing.description}</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Quantity Available</Label>
                                            <p className="text-lg font-semibold text-emerald-600">{selectedListing.quantity}</p>
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Freshness</Label>
                                            <div className="mt-1">
                                                <Badge className={`px-2 py-1 text-xs border ${getFreshnessColor(selectedListing.freshness)}`}>
                                                    {selectedListing.freshness.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Expiry</Label>
                                            <p className={`font-medium ${getUrgencyColor(selectedListing.expiresIn)}`}>
                                                {selectedListing.expiresIn}
                                                {parseFloat(selectedListing.expiresIn) <= 2 && (
                                                    <AlertTriangle className="w-4 h-4 text-red-500 inline ml-1" />
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Provider Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <Label className="text-sm font-medium text-gray-600">Provider</Label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <User className="w-8 h-8 text-gray-600" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{selectedListing.provider}</p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm text-gray-600">{selectedListing.providerRating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Location */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Location</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-900">{selectedListing.location}</span>
                                        </div>
                                        <p className="text-sm text-emerald-600 font-medium mt-1">
                                            {selectedListing.distance} km away
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Photos */}
                            {selectedListing.photos && selectedListing.photos.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Photos</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                        {selectedListing.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`Food photo ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dietary Information */}
                            {selectedListing.dietaryInfo && selectedListing.dietaryInfo.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Dietary Information</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedListing.dietaryInfo.map((info, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {info}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Allergens */}
                            {selectedListing.allergens && selectedListing.allergens.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Allergens</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedListing.allergens.map((allergen, index) => (
                                            <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-200">
                                                {allergen}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pickup Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <Label className="text-sm font-medium text-blue-800">Pickup Instructions</Label>
                                <p className="text-blue-700 mt-1">{selectedListing.pickupInstructions}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                <Button 
                                    onClick={() => {
                                        handleRequestFood(selectedListing.id);
                                        setShowDetailsModal(false);
                                    }}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Request This Food
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Provider
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Message
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Directions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BrowseListings;
