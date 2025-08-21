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

    // Mock data
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockListings = [
                {
                    id: 1,
                    title: "Fresh Vegetables & Fruits",
                    description: "Assorted fresh vegetables including tomatoes, carrots, leafy greens, and seasonal fruits",
                    provider: "Green Grocery Store",
                    providerRating: 4.8,
                    distance: 0.5,
                    location: "Downtown Market, 123 Main St",
                    freshness: "FRESH",
                    category: "vegetables",
                    quantity: "5 kg",
                    expiresIn: "2 hours",
                    status: "available",
                    photos: [],
                    phone: "+1234567890",
                    allergens: ["None"],
                    dietaryInfo: ["Vegetarian", "Vegan"],
                    pickupInstructions: "Use back entrance, ask for manager"
                },
                {
                    id: 2,
                    title: "Cooked Meals - Lunch Special",
                    description: "Rice, dal, vegetable curry, and chapati. Freshly prepared vegetarian meal",
                    provider: "University Canteen",
                    providerRating: 4.5,
                    distance: 1.2,
                    location: "Campus Area, Building A",
                    freshness: "FRESHLY_COOKED",
                    category: "cooked_meals",
                    quantity: "20 portions",
                    expiresIn: "4 hours",
                    status: "available",
                    photos: [],
                    phone: "+1234567891",
                    allergens: ["Gluten"],
                    dietaryInfo: ["Vegetarian"],
                    pickupInstructions: "Main counter, mention ResQMeal"
                },
                {
                    id: 3,
                    title: "Bakery Items - Bread & Pastries",
                    description: "Fresh bread loaves, croissants, and assorted pastries from morning batch",
                    provider: "Local Bakery",
                    providerRating: 4.3,
                    distance: 0.8,
                    location: "Main Street, Shop 45",
                    freshness: "GOOD",
                    category: "bakery",
                    quantity: "15 items",
                    expiresIn: "6 hours",
                    status: "urgent",
                    photos: [],
                    phone: "+1234567892",
                    allergens: ["Gluten", "Dairy"],
                    dietaryInfo: ["Vegetarian"],
                    pickupInstructions: "Front counter, call before pickup"
                },
                {
                    id: 4,
                    title: "Dairy Products",
                    description: "Fresh milk, yogurt, and cheese. All products are within expiry date",
                    provider: "City Dairy Farm",
                    providerRating: 4.9,
                    distance: 2.1,
                    location: "Farm Road, Sector 7",
                    freshness: "FRESH",
                    category: "dairy",
                    quantity: "3 kg",
                    expiresIn: "1 day",
                    status: "available",
                    photos: [],
                    phone: "+1234567893",
                    allergens: ["Dairy"],
                    dietaryInfo: ["Vegetarian"],
                    pickupInstructions: "Farm gate, weekdays 9 AM - 5 PM"
                },
                {
                    id: 5,
                    title: "Surplus Restaurant Food",
                    description: "Mixed cuisine including rice dishes, grilled items, and salads",
                    provider: "Downtown Restaurant",
                    providerRating: 4.6,
                    distance: 1.5,
                    location: "Food Court, Level 2",
                    freshness: "FRESHLY_COOKED",
                    category: "cooked_meals",
                    quantity: "30 portions",
                    expiresIn: "3 hours",
                    status: "available",
                    photos: [],
                    phone: "+1234567894",
                    allergens: ["Nuts", "Gluten"],
                    dietaryInfo: ["Mixed"],
                    pickupInstructions: "Staff entrance, ask for kitchen manager"
                },
                {
                    id: 6,
                    title: "Seasonal Fruits",
                    description: "Apples, oranges, bananas - slightly overripe but still good for consumption",
                    provider: "Fruit Vendor",
                    providerRating: 4.2,
                    distance: 0.3,
                    location: "Street Market, Stall 12",
                    freshness: "GOOD",
                    category: "fruits",
                    quantity: "8 kg",
                    expiresIn: "8 hours",
                    status: "available",
                    photos: [],
                    phone: "+1234567895",
                    allergens: ["None"],
                    dietaryInfo: ["Vegan", "Vegetarian"],
                    pickupInstructions: "Direct from stall, available till 8 PM"
                }
            ];

            setListings(mockListings);
            setFilteredListings(mockListings);
            setLoading(false);
        }, 1000);
    }, []);

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

    const handleRequestFood = (listingId) => {
        toast.success('Food request sent successfully!');
        // Update the listing or handle request logic
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
        </div>
    );
};

export default BrowseListings;
