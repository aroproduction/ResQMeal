'use client';

import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    Clock,
    FileText,
    Camera,
    Edit,
    Save,
    X,
    Settings,
    Shield,
    Globe,
    Award,
    Star,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Leaf
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "sonner";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        user: {
            id: '',
            name: '',
            email: '',
            phone: '',
            role: '',
            createdAt: ''
        },
        profile: {
            avatar: '',
            bio: '',
            sustainabilityScore: 0
        },
        providerDetails: {
            businessName: '',
            licenseNo: '',
            operatingHours: {},
            specialization: [],
            capacity: 0,
            location: null
        },
        analytics: {
            listingsCreated: 0,
            foodShared: 0,
            carbonFootprintSaved: 0,
            waterFootprintSaved: 0,
            streak: 0,
            level: 1,
            points: 0,
            badges: []
        }
    });
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/provider/profile');
            setProfileData(response.data);
            setEditForm({
                name: response.data.user.name,
                phone: response.data.user.phone || '',
                bio: response.data.profile?.bio || '',
                businessName: response.data.providerDetails?.businessName || '',
                licenseNo: response.data.providerDetails?.licenseNo || '',
                capacity: response.data.providerDetails?.capacity || 0
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await axios.put('/api/provider/profile', editForm);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            fetchProfileData();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getLevel = (points) => {
        if (points < 100) return 1;
        if (points < 500) return 2;
        if (points < 1000) return 3;
        if (points < 2500) return 4;
        return 5;
    };

    const getLevelProgress = (points) => {
        const currentLevel = getLevel(points);
        const levelThresholds = [0, 100, 500, 1000, 2500, 5000];
        const currentThreshold = levelThresholds[currentLevel - 1];
        const nextThreshold = levelThresholds[currentLevel] || 5000;
        return Math.min(100, ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-gray-900">
                            Profile Settings
                        </h1>
                        <p className="font-body text-gray-600 mt-1">
                            Manage your account and provider information
                        </p>
                    </div>
                    <Button
                        onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                        disabled={saving}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-body"
                    >
                        {saving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : isEditing ? (
                            <Save className="w-4 h-4 mr-2" />
                        ) : (
                            <Edit className="w-4 h-4 mr-2" />
                        )}
                        {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-emerald-600" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {profileData.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name" className="font-body text-sm font-medium text-gray-700">
                                                    Full Name
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="name"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="mt-1 font-body"
                                                    />
                                                ) : (
                                                    <p className="font-body text-gray-900 mt-1">{profileData.user.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="font-body text-sm font-medium text-gray-700">
                                                    Email
                                                </Label>
                                                <p className="font-body text-gray-900 mt-1 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    {profileData.user.email.slice(0, 20)}...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone" className="font-body text-sm font-medium text-gray-700">
                                            Phone Number
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                id="phone"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="mt-1 font-body"
                                                placeholder="Enter phone number"
                                            />
                                        ) : (
                                            <p className="font-body text-gray-900 mt-1 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                {profileData.user.phone || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="font-body text-sm font-medium text-gray-700">
                                            Member Since
                                        </Label>
                                        <p className="font-body text-gray-900 mt-1">
                                            {formatDate(profileData.user.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="bio" className="font-body text-sm font-medium text-gray-700">
                                        Bio
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="bio"
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="mt-1 font-body"
                                            placeholder="Tell us about yourself"
                                        />
                                    ) : (
                                        <p className="font-body text-gray-900 mt-1">
                                            {profileData.profile?.bio || 'No bio provided'}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Provider Details */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                    <Building className="w-5 h-5 text-emerald-600" />
                                    Provider Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="businessName" className="font-body text-sm font-medium text-gray-700">
                                            Business Name
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                id="businessName"
                                                value={editForm.businessName}
                                                onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                                                className="mt-1 font-body"
                                                placeholder="Enter business name"
                                            />
                                        ) : (
                                            <p className="font-body text-gray-900 mt-1">
                                                {profileData.providerDetails?.businessName || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="licenseNo" className="font-body text-sm font-medium text-gray-700">
                                            License Number
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                id="licenseNo"
                                                value={editForm.licenseNo}
                                                onChange={(e) => setEditForm({ ...editForm, licenseNo: e.target.value })}
                                                className="mt-1 font-body"
                                                placeholder="Enter license number"
                                            />
                                        ) : (
                                            <p className="font-body text-gray-900 mt-1 flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                                {profileData.providerDetails?.licenseNo || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="capacity" className="font-body text-sm font-medium text-gray-700">
                                        Daily Capacity (servings)
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="capacity"
                                            type="number"
                                            value={editForm.capacity}
                                            onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                                            className="mt-1 font-body"
                                            placeholder="Enter daily capacity"
                                        />
                                    ) : (
                                        <p className="font-body text-gray-900 mt-1">
                                            {profileData.providerDetails?.capacity || 0} servings per day
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Stats and Achievements */}
                    <div className="space-y-6">
                        {/* Level and Points */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-emerald-600" />
                                    Your Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-3">
                                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
                                        {getLevel(profileData.analytics.points)}
                                    </div>
                                    <div>
                                        <p className="font-heading text-lg font-bold text-gray-900">
                                            Level {getLevel(profileData.analytics.points)}
                                        </p>
                                        <p className="font-body text-sm text-gray-600">
                                            {profileData.analytics.points} points
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${getLevelProgress(profileData.analytics.points)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Impact Stats */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-emerald-600" />
                                    Impact Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-body text-sm text-gray-600">Food Shared</span>
                                        <span className="font-body font-bold text-emerald-600">
                                            {profileData.analytics.foodShared}kg
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-body text-sm text-gray-600">CO₂ Saved</span>
                                        <span className="font-body font-bold text-green-600">
                                            {profileData.analytics.carbonFootprintSaved}kg
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-body text-sm text-gray-600">Water Saved</span>
                                        <span className="font-body font-bold text-blue-600">
                                            {profileData.analytics.waterFootprintSaved}L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-body text-sm text-gray-600">Listings Created</span>
                                        <span className="font-body font-bold text-purple-600">
                                            {profileData.analytics.listingsCreated}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sustainability Score */}
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-emerald-600" />
                                    Sustainability Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                                        {Math.round(profileData.profile?.sustainabilityScore || 0)}
                                    </div>
                                    <p className="font-body text-sm text-gray-600">
                                        Keep sharing to improve your score!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Streak */}
                        {profileData.analytics.streak > 0 && (
                            <Card className="shadow-sm border-gray-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        Current Streak
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-500 mb-1">
                                            {profileData.analytics.streak} days
                                        </div>
                                        <p className="font-body text-sm text-gray-600">
                                            Best: {profileData.analytics.longestStreak} days
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Cancel Edit Mode */}
                {isEditing && (
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setEditForm({
                                    name: profileData.user.name,
                                    phone: profileData.user.phone || '',
                                    bio: profileData.profile?.bio || '',
                                    businessName: profileData.providerDetails?.businessName || '',
                                    licenseNo: profileData.providerDetails?.licenseNo || '',
                                    capacity: profileData.providerDetails?.capacity || 0
                                });
                            }}
                            className="font-body"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
