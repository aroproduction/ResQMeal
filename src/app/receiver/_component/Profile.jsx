'use client';

import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit,
    Save,
    X,
    Camera,
    Bell,
    Shield,
    Heart,
    Award,
    Calendar,
    Package,
    Star,
    Leaf,
    Settings,
    CheckCircle,
    AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        organizationType: "",
        address: "",
        description: "",
        servingCapacity: "",
        operatingHours: "",
        dietaryPreferences: [],
        allergens: [],
        contactPerson: "",
        establishedDate: "",
        avatar: null
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        weeklyDigest: true,
        urgentAlerts: true,
        maxDistance: 5,
        autoRequest: false
    });

    const [stats, setStats] = useState({
        totalRequests: 0,
        mealsReceived: 0,
        favoriteProviders: 0,
        rating: 0,
        impactScore: 0,
        joinDate: "",
        lastActive: ""
    });

    // Fetch profile data from API
    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/receiver/profile');
            if (response.ok) {
                const data = await response.json();
                const profile = data.data;
                
                setProfileData({
                    name: profile.name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    organizationType: "Receiver", // Default for receiver role
                    address: profile.profile?.campus?.address ? 
                        `${profile.profile.campus.name}, ${JSON.stringify(profile.profile.campus.address)}` : "",
                    description: profile.profile?.bio || "",
                    servingCapacity: "", // Not applicable for receivers
                    operatingHours: "", // Not applicable for receivers
                    dietaryPreferences: profile.profile?.preferences?.dietaryRestrictions || [],
                    allergens: profile.profile?.preferences?.allergens || [],
                    contactPerson: profile.name || "",
                    establishedDate: new Date(profile.createdAt).toLocaleDateString(),
                    avatar: profile.profile?.avatar || null,
                    studentId: profile.profile?.studentId || "",
                    employeeId: profile.profile?.employeeId || "",
                    department: profile.profile?.department || ""
                });

                // Set stats from analytics
                const analytics = profile.analytics;
                setStats({
                    totalRequests: analytics?.claimsMade || 0,
                    mealsReceived: Math.round(analytics?.foodReceived || 0),
                    favoriteProviders: 0, // Could be implemented later
                    rating: 4.5, // Default or fetch from feedback
                    impactScore: analytics?.sustainabilityScore || 0,
                    joinDate: new Date(profile.createdAt).toLocaleDateString(),
                    lastActive: "Recently" // Could track login times
                });
            } else {
                console.error('Failed to fetch profile');
                toast.error('Failed to load profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const dietaryOptions = [
        "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free", "Dairy-Free", "Nut-Free"
    ];

    const allergenOptions = [
        "Nuts", "Dairy", "Gluten", "Eggs", "Soy", "Fish", "Shellfish", "Sesame"
    ];

    const organizationTypes = [
        "NGO", "Charity", "Religious Organization", "Community Center", 
        "Food Bank", "Shelter", "School", "Healthcare Facility", "Other"
    ];

    const handleSave = async () => {
        try {
            const response = await fetch('/api/receiver/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: profileData.name,
                    phone: profileData.phone,
                    bio: profileData.description,
                    department: profileData.department,
                    studentId: profileData.studentId,
                    employeeId: profileData.employeeId,
                    preferences: {
                        dietaryRestrictions: profileData.dietaryPreferences,
                        allergens: profileData.allergens
                    }
                })
            });

            if (response.ok) {
                setIsEditing(false);
                toast.success('Profile updated successfully!');
                await fetchProfile(); // Refresh the profile data
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original data if needed
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayChange = (field, value, checked) => {
        setProfileData(prev => ({
            ...prev,
            [field]: checked 
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handlePreferenceChange = (field, value) => {
        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {profileData.name ? profileData.name.charAt(0) : 'U'}
                                </div>
                                {isEditing && (
                                    <Button variant="outline" size="sm">
                                        <Camera className="w-4 h-4 mr-2" />
                                        Change Photo
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Organization Name</Label>
                                    <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="organizationType">Organization Type</Label>
                                    {isEditing ? (
                                        <select
                                            id="organizationType"
                                            value={profileData.organizationType}
                                            onChange={(e) => handleInputChange('organizationType', e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">Select type</option>
                                            {organizationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            value={profileData.organizationType}
                                            disabled
                                            className="mt-1"
                                        />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={profileData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contactPerson">Contact Person</Label>
                                    <Input
                                        id="contactPerson"
                                        value={profileData.contactPerson}
                                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="establishedDate">Established Date</Label>
                                    <Input
                                        id="establishedDate"
                                        type="date"
                                        value={profileData.establishedDate}
                                        onChange={(e) => handleInputChange('establishedDate', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Full Address</Label>
                                <Input
                                    id="address"
                                    value={profileData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Organization Description</Label>
                                <textarea
                                    id="description"
                                    value={profileData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md resize-none disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="servingCapacity">Serving Capacity</Label>
                                    <Input
                                        id="servingCapacity"
                                        value={profileData.servingCapacity}
                                        onChange={(e) => handleInputChange('servingCapacity', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="e.g., 200 meals per day"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="operatingHours">Operating Hours</Label>
                                    <Input
                                        id="operatingHours"
                                        value={profileData.operatingHours}
                                        onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="e.g., 6:00 AM - 10:00 PM"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dietary Preferences */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-5 h-5" />
                                Dietary Preferences & Allergens
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Dietary Preferences</Label>
                                <div className="flex flex-wrap gap-2">
                                    {dietaryOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={profileData.dietaryPreferences.includes(option)}
                                                onChange={(e) => handleArrayChange('dietaryPreferences', option, e.target.checked)}
                                                disabled={!isEditing}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">Allergens to Avoid</Label>
                                <div className="flex flex-wrap gap-2">
                                    {allergenOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={profileData.allergens.includes(option)}
                                                onChange={(e) => handleArrayChange('allergens', option, e.target.checked)}
                                                disabled={!isEditing}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-gray-600">Receive updates via email</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.emailNotifications}
                                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">SMS Notifications</p>
                                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.smsNotifications}
                                        onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-gray-600">Receive instant app notifications</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.pushNotifications}
                                        onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Urgent Alerts</p>
                                        <p className="text-sm text-gray-600">Get notified about urgent food availability</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.urgentAlerts}
                                        onChange={(e) => handlePreferenceChange('urgentAlerts', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Weekly Digest</p>
                                        <p className="text-sm text-gray-600">Receive weekly summary of activities</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.weeklyDigest}
                                        onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="text-sm font-medium mb-2 block">Maximum Distance for Notifications (km)</Label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={preferences.maxDistance}
                                    onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1 km</span>
                                    <span className="font-medium">{preferences.maxDistance} km</span>
                                    <span>20 km</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Stats */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Profile Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                    <Package className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-emerald-900">{stats.totalRequests}</p>
                                    <p className="text-xs text-emerald-700">Total Requests</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <Heart className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-blue-900">{stats.mealsReceived}</p>
                                    <p className="text-xs text-blue-700">Meals Received</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <Star className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-purple-900">{stats.rating}</p>
                                    <p className="text-xs text-purple-700">Rating</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <Leaf className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-green-900">{stats.impactScore}</p>
                                    <p className="text-xs text-green-700">Impact Points</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Member since:</span>
                                    <span className="font-medium">{formatDate(stats.joinDate)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Last active:</span>
                                    <span className="font-medium">{formatDate(stats.lastActive)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Favorite providers:</span>
                                    <span className="font-medium">{stats.favoriteProviders}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Status */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Verification Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Email Verified</span>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Phone Verified</span>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Organization Verified</span>
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            
                            <Button variant="outline" size="sm" className="w-full mt-3">
                                Complete Verification
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Mail className="w-4 h-4 mr-2" />
                                Change Password
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Bell className="w-4 h-4 mr-2" />
                                Notification Settings
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Shield className="w-4 h-4 mr-2" />
                                Privacy Settings
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                                <X className="w-4 h-4 mr-2" />
                                Deactivate Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
