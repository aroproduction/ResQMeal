'use client';

import React, { useState, useEffect } from "react";
import {
    MapPin,
    Navigation,
    Clock,
    Heart,
    Phone,
    Eye,
    Filter,
    Layers,
    Target,
    RefreshCw,
    Star,
    Package,
    AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MapView = () => {
    const [selectedListing, setSelectedListing] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [listings, setListings] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        distance: 5,
        freshness: "all",
        category: "all"
    });

    // Mock data for demonstration
    useEffect(() => {
        const mockListings = [
            {
                id: 1,
                title: "Fresh Vegetables & Fruits",
                provider: "Green Grocery Store",
                location: { lat: 28.6129, lng: 77.2295 },
                address: "Downtown Market, 123 Main St",
                distance: 0.5,
                freshness: "FRESH",
                category: "vegetables",
                quantity: "5 kg",
                expiresIn: "2 hours",
                status: "available",
                phone: "+1234567890",
                rating: 4.8,
                urgency: "high"
            },
            {
                id: 2,
                title: "Cooked Meals - Lunch",
                provider: "University Canteen",
                location: { lat: 28.6149, lng: 77.2065 },
                address: "Campus Area, Building A",
                distance: 1.2,
                freshness: "FRESHLY_COOKED",
                category: "cooked_meals",
                quantity: "20 portions",
                expiresIn: "4 hours",
                status: "available",
                phone: "+1234567891",
                rating: 4.5,
                urgency: "medium"
            },
            {
                id: 3,
                title: "Bakery Items",
                provider: "Local Bakery",
                location: { lat: 28.6119, lng: 77.2180 },
                address: "Main Street, Shop 45",
                distance: 0.8,
                freshness: "GOOD",
                category: "bakery",
                quantity: "15 items",
                expiresIn: "6 hours",
                status: "urgent",
                phone: "+1234567892",
                rating: 4.3,
                urgency: "high"
            },
            {
                id: 4,
                title: "Dairy Products",
                provider: "City Dairy Farm",
                location: { lat: 28.6159, lng: 77.2150 },
                address: "Farm Road, Sector 7",
                distance: 2.1,
                freshness: "FRESH",
                category: "dairy",
                quantity: "3 kg",
                expiresIn: "1 day",
                status: "available",
                phone: "+1234567893",
                rating: 4.9,
                urgency: "low"
            },
            {
                id: 5,
                title: "Restaurant Surplus",
                provider: "Downtown Restaurant",
                location: { lat: 28.6109, lng: 77.2200 },
                address: "Food Court, Level 2",
                distance: 1.5,
                freshness: "FRESHLY_COOKED",
                category: "cooked_meals",
                quantity: "30 portions",
                expiresIn: "3 hours",
                status: "available",
                phone: "+1234567894",
                rating: 4.6,
                urgency: "medium"
            }
        ];

        setListings(mockListings);
        setSelectedListing(mockListings[0]);
    }, []);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);
                    setMapCenter(location);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Could not get your location. Using default location.");
                }
            );
        }
    }, []);

    const getMarkerColor = (urgency, status) => {
        if (status === "urgent") return "bg-red-500";
        switch (urgency) {
            case "high": return "bg-orange-500";
            case "medium": return "bg-yellow-500";
            case "low": return "bg-green-500";
            default: return "bg-blue-500";
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

    const handleRequestFood = (listingId) => {
        toast.success('Food request sent successfully!');
    };

    const handleGetDirections = (listing) => {
        if (userLocation) {
            const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${listing.location.lat},${listing.location.lng}`;
            window.open(googleMapsUrl, '_blank');
        } else {
            toast.error("Unable to get your location for directions");
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 h-screen max-h-screen overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Map View</h1>
                    <p className="text-gray-600">Find food donations near you</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button variant="outline">
                        <Layers className="w-4 h-4 mr-2" />
                        View
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Map Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Distance (km)
                                </label>
                                <select 
                                    value={filters.distance}
                                    onChange={(e) => setFilters({...filters, distance: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value={1}>Within 1 km</option>
                                    <option value={2}>Within 2 km</option>
                                    <option value={5}>Within 5 km</option>
                                    <option value={10}>Within 10 km</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Freshness
                                </label>
                                <select 
                                    value={filters.freshness}
                                    onChange={(e) => setFilters({...filters, freshness: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All freshness levels</option>
                                    <option value="FRESHLY_COOKED">Freshly Cooked</option>
                                    <option value="FRESH">Fresh</option>
                                    <option value="GOOD">Good</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select 
                                    value={filters.category}
                                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All categories</option>
                                    <option value="vegetables">Vegetables</option>
                                    <option value="fruits">Fruits</option>
                                    <option value="bakery">Bakery</option>
                                    <option value="dairy">Dairy</option>
                                    <option value="cooked_meals">Cooked Meals</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content - Split View */}
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Map Container */}
                <div className="flex-1 lg:w-2/3">
                    <Card className="h-full">
                        <CardContent className="p-0 h-full">
                            {/* Placeholder for actual map implementation */}
                            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                                {/* Mock Map Interface */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h3>
                                        <p className="text-gray-600 mb-4">
                                            This would show an interactive map with food donation locations
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Integration with Google Maps, Mapbox, or similar service required
                                        </p>
                                    </div>
                                </div>

                                {/* Map Controls */}
                                <div className="absolute top-4 right-4 space-y-2">
                                    <Button size="sm" className="bg-white text-gray-700 hover:bg-gray-50 shadow-md">
                                        <Target className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" className="bg-white text-gray-700 hover:bg-gray-50 shadow-md">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Mock Markers */}
                                <div className="absolute inset-0">
                                    {listings.map((listing, index) => (
                                        <div
                                            key={listing.id}
                                            className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg ${getMarkerColor(listing.urgency, listing.status)}`}
                                            style={{
                                                left: `${20 + (index * 15)}%`,
                                                top: `${30 + (index * 10)}%`
                                            }}
                                            onClick={() => setSelectedListing(listing)}
                                        >
                                            <div className="absolute -top-8 -left-8 w-16 h-8 bg-white rounded shadow-lg border border-gray-200 flex items-center justify-center text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
                                                {listing.distance}km
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span>Low urgency</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span>Medium urgency</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span>High urgency</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span>Urgent pickup</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Listing Details */}
                <div className="lg:w-1/3 space-y-4">
                    {selectedListing ? (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-900">{selectedListing.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Status and Freshness */}
                                <div className="flex items-center gap-2">
                                    <Badge className={`px-2 py-1 text-xs border ${
                                        selectedListing.status === "urgent" 
                                            ? "text-red-600 bg-red-50 border-red-200"
                                            : "text-emerald-600 bg-emerald-50 border-emerald-200"
                                    }`}>
                                        {selectedListing.status.charAt(0).toUpperCase() + selectedListing.status.slice(1)}
                                    </Badge>
                                    <Badge className={`px-2 py-1 text-xs border ${getFreshnessColor(selectedListing.freshness)}`}>
                                        {selectedListing.freshness.replace('_', ' ')}
                                    </Badge>
                                </div>

                                {/* Provider Info */}
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{selectedListing.provider}</h4>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-sm text-gray-600">{selectedListing.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{selectedListing.address}</p>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Distance:</span>
                                        <span className="font-medium">{selectedListing.distance} km</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{selectedListing.quantity}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Expires in:</span>
                                        <span className={`font-medium ${
                                            parseFloat(selectedListing.expiresIn) <= 2 ? 'text-red-600' : 'text-gray-900'
                                        }`}>
                                            {selectedListing.expiresIn}
                                        </span>
                                    </div>
                                </div>

                                {/* Urgency Warning */}
                                {selectedListing.urgency === "high" && (
                                    <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm text-orange-800">Pickup needed soon!</span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    <Button 
                                        onClick={() => handleRequestFood(selectedListing.id)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        Request Food
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleGetDirections(selectedListing)}
                                        >
                                            <Navigation className="w-4 h-4 mr-1" />
                                            Directions
                                        </Button>
                                        <Button variant="outline">
                                            <Phone className="w-4 h-4 mr-1" />
                                            Call
                                        </Button>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Full Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-lg">
                            <CardContent className="p-8 text-center">
                                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Location</h3>
                                <p className="text-gray-600">
                                    Click on a marker on the map to view food donation details
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Nearby Listings */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900">Nearby Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {listings.slice(0, 5).map((listing) => (
                                    <div
                                        key={listing.id}
                                        onClick={() => setSelectedListing(listing)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                            selectedListing?.id === listing.id
                                                ? 'border-emerald-300 bg-emerald-50'
                                                : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-gray-900 text-sm truncate">{listing.title}</h4>
                                            <span className="text-xs text-emerald-600 font-medium">{listing.distance}km</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">{listing.provider}</p>
                                        <div className="flex items-center justify-between">
                                            <Badge className={`px-1 py-0.5 text-xs ${
                                                listing.status === "urgent" 
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-emerald-100 text-emerald-600"
                                            }`}>
                                                {listing.status}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                                <Clock className="w-3 h-3 inline mr-1" />
                                                {listing.expiresIn}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MapView;
