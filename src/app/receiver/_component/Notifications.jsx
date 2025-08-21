'use client';

import React, { useState, useEffect } from "react";
import {
    Bell,
    Check,
    X,
    Clock,
    MapPin,
    Heart,
    AlertTriangle,
    Package,
    Star,
    MessageCircle,
    Eye,
    Filter,
    MoreVertical,
    Trash2,
    Mail,
    Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(null);

    // Extended mock notifications for receiver
    useEffect(() => {
        const mockNotifications = [
            {
                id: 1,
                type: "new_listing",
                title: "New Food Listing Available",
                message: "Fresh vegetables available 0.5km away from Green Grocery Store",
                time: "2024-08-21T10:00:00Z",
                unread: true,
                priority: "high",
                actionRequired: true,
                details: {
                    provider: "Green Grocery Store",
                    distance: "0.5 km",
                    expiresIn: "2 hours",
                    quantity: "5 kg"
                }
            },
            {
                id: 2,
                type: "request_accepted",
                title: "Request Accepted",
                message: "Your request for vegetables was accepted by Farm Market",
                time: "2024-08-21T09:00:00Z",
                unread: true,
                priority: "high",
                actionRequired: true,
                details: {
                    provider: "Farm Market",
                    otp: "1234",
                    pickupTime: "Today 4:00 PM",
                    pickupLocation: "Downtown Market, Stall 12"
                }
            },
            {
                id: 3,
                type: "pickup_reminder",
                title: "Pickup Reminder",
                message: "Pickup reminder: Fresh bread expires in 2 hours",
                time: "2024-08-21T07:00:00Z",
                unread: false,
                priority: "medium",
                actionRequired: true,
                details: {
                    provider: "Artisan Bakery",
                    otp: "5678",
                    expiresIn: "2 hours",
                    pickupLocation: "Main Street, Shop 45"
                }
            },
            {
                id: 4,
                type: "request_cancelled",
                title: "Request Cancelled",
                message: "Provider cancelled your dairy products request due to quality concerns",
                time: "2024-08-21T04:00:00Z",
                unread: false,
                priority: "medium",
                actionRequired: false,
                details: {
                    provider: "City Dairy Farm",
                    reason: "Quality concerns",
                    requestedQuantity: "2 kg"
                }
            },
            {
                id: 5,
                type: "rating_request",
                title: "Rate Your Experience",
                message: "Please rate your experience with University Canteen",
                time: "2024-08-20T22:00:00Z",
                unread: false,
                priority: "low",
                actionRequired: true,
                details: {
                    provider: "University Canteen",
                    orderCompleted: "Yesterday 2:00 PM"
                }
            },
            {
                id: 6,
                type: "new_listing",
                title: "Urgent Food Available",
                message: "Restaurant surplus food available - expires soon!",
                time: "2024-08-20T10:00:00Z",
                unread: false,
                priority: "high",
                actionRequired: true,
                details: {
                    provider: "Downtown Restaurant",
                    distance: "1.5 km",
                    expiresIn: "1 hour",
                    quantity: "30 portions"
                }
            },
            {
                id: 7,
                type: "system",
                title: "Profile Update",
                message: "Your dietary preferences have been updated successfully",
                time: "2024-08-19T10:00:00Z",
                unread: false,
                priority: "low",
                actionRequired: false,
                details: {}
            },
            {
                id: 8,
                type: "weekly_summary",
                title: "Weekly Summary",
                message: "You received 12 meals this week and helped reduce 8kg of food waste!",
                time: "2024-08-18T10:00:00Z",
                unread: false,
                priority: "low",
                actionRequired: false,
                details: {
                    mealsReceived: 12,
                    wasteReduced: "8kg",
                    impactPoints: 240
                }
            }
        ];

        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
    }, []);

    // Filter notifications
    useEffect(() => {
        let filtered = [...notifications];

        if (selectedType !== "all") {
            if (selectedType === "unread") {
                filtered = filtered.filter(n => n.unread);
            } else if (selectedType === "action_required") {
                filtered = filtered.filter(n => n.actionRequired);
            } else {
                filtered = filtered.filter(n => n.type === selectedType);
            }
        }

        setFilteredNotifications(filtered);
    }, [notifications, selectedType]);

    const getTypeIcon = (type) => {
        switch (type) {
            case "new_listing":
                return <Package className="w-5 h-5 text-emerald-600" />;
            case "request_accepted":
                return <Check className="w-5 h-5 text-green-600" />;
            case "request_cancelled":
                return <X className="w-5 h-5 text-red-600" />;
            case "pickup_reminder":
                return <Clock className="w-5 h-5 text-orange-600" />;
            case "rating_request":
                return <Star className="w-5 h-5 text-yellow-600" />;
            case "system":
                return <Bell className="w-5 h-5 text-blue-600" />;
            case "weekly_summary":
                return <Heart className="w-5 h-5 text-purple-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "border-l-red-500";
            case "medium":
                return "border-l-orange-500";
            case "low":
                return "border-l-blue-500";
            default:
                return "border-l-gray-500";
        }
    };

    const formatTime = (timeString) => {
        try {
            const now = new Date();
            const time = new Date(timeString);
            
            // Check if the date is valid
            if (isNaN(time.getTime())) {
                return 'Unknown time';
            }
            
            const diffInMinutes = Math.floor((now - time) / (1000 * 60));
            
            if (diffInMinutes < 60) {
                return `${diffInMinutes}m ago`;
            } else if (diffInMinutes < 1440) {
                return `${Math.floor(diffInMinutes / 60)}h ago`;
            } else {
                return `${Math.floor(diffInMinutes / 1440)}d ago`;
            }
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Unknown time';
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, unread: false } : n
        ));
        toast.success('Notification marked as read');
    };

    const markAsUnread = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, unread: true } : n
        ));
        toast.success('Notification marked as unread');
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted');
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
        toast.success('All notifications marked as read');
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        toast.success('All notifications cleared');
    };

    const notificationTypes = [
        { id: "all", label: "All", count: notifications.length },
        { id: "unread", label: "Unread", count: notifications.filter(n => n.unread).length },
        { id: "action_required", label: "Action Required", count: notifications.filter(n => n.actionRequired).length },
        { id: "new_listing", label: "New Listings", count: notifications.filter(n => n.type === "new_listing").length },
        { id: "request_accepted", label: "Accepted", count: notifications.filter(n => n.type === "request_accepted").length },
        { id: "pickup_reminder", label: "Reminders", count: notifications.filter(n => n.type === "pickup_reminder").length }
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your food requests and donations</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={markAllAsRead}>
                        <Check className="w-4 h-4 mr-2" />
                        Mark All Read
                    </Button>
                    <Button variant="outline" onClick={clearAllNotifications}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex flex-wrap border-b border-gray-200">
                        {notificationTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                                    selectedType === type.id
                                        ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                                        : "border-transparent text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                                }`}
                            >
                                {type.label}
                                {type.count > 0 && (
                                    <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs">
                                        {type.count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <Card 
                            key={notification.id} 
                            className={`transition-all duration-200 hover:shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
                                notification.unread ? 'bg-blue-50/30' : 'bg-white'
                            }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-semibold ${notification.unread ? 'text-gray-900' : 'text-gray-800'}`}>
                                                    {notification.title}
                                                </h3>
                                                {notification.unread && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                )}
                                                {notification.actionRequired && (
                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                                        Action Required
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                                            
                                            {/* Notification Details */}
                                            {Object.keys(notification.details).length > 0 && (
                                                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                                    {notification.details.provider && (
                                                        <p><strong>Provider:</strong> {notification.details.provider}</p>
                                                    )}
                                                    {notification.details.distance && (
                                                        <p><strong>Distance:</strong> {notification.details.distance}</p>
                                                    )}
                                                    {notification.details.quantity && (
                                                        <p><strong>Quantity:</strong> {notification.details.quantity}</p>
                                                    )}
                                                    {notification.details.expiresIn && (
                                                        <p><strong>Expires in:</strong> {notification.details.expiresIn}</p>
                                                    )}
                                                    {notification.details.otp && (
                                                        <p className="font-semibold text-green-700">
                                                            <strong>OTP:</strong> {notification.details.otp}
                                                        </p>
                                                    )}
                                                    {notification.details.pickupTime && (
                                                        <p><strong>Pickup Time:</strong> {notification.details.pickupTime}</p>
                                                    )}
                                                    {notification.details.pickupLocation && (
                                                        <p><strong>Location:</strong> {notification.details.pickupLocation}</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(notification.time)}
                                                </span>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {notification.type === "new_listing" && notification.actionRequired && (
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                            <Heart className="w-3 h-3 mr-1" />
                                                            Request
                                                        </Button>
                                                    )}
                                                    {notification.type === "request_accepted" && notification.actionRequired && (
                                                        <Button size="sm" variant="outline">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            View Details
                                                        </Button>
                                                    )}
                                                    {notification.type === "rating_request" && notification.actionRequired && (
                                                        <Button size="sm" variant="outline">
                                                            <Star className="w-3 h-3 mr-1" />
                                                            Rate
                                                        </Button>
                                                    )}
                                                    {notification.type === "pickup_reminder" && notification.actionRequired && (
                                                        <Button size="sm" variant="outline">
                                                            <Navigation className="w-3 h-3 mr-1" />
                                                            Directions
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* More Options */}
                                    <div className="relative flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowActionMenu(showActionMenu === notification.id ? null : notification.id)}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>

                                        {showActionMenu === notification.id && (
                                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                                                <div className="py-1">
                                                    {notification.unread ? (
                                                        <button
                                                            onClick={() => {
                                                                markAsRead(notification.id);
                                                                setShowActionMenu(null);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Mark as read
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                markAsUnread(notification.id);
                                                                setShowActionMenu(null);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                            Mark as unread
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            deleteNotification(notification.id);
                                                            setShowActionMenu(null);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="py-12">
                        <CardContent className="text-center">
                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">
                                {selectedType === "all" 
                                    ? "You're all caught up! No new notifications."
                                    : `No ${selectedType.replace('_', ' ')} notifications found.`
                                }
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Click outside to close menu */}
            {showActionMenu && (
                <div 
                    className="fixed inset-0 z-5"
                    onClick={() => setShowActionMenu(null)}
                />
            )}
        </div>
    );
};

export default Notifications;
