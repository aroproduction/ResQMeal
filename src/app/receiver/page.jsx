"use client"

import React, { useState } from "react";
import {
    Search,
    MapPin,
    Clock,
    Bell,
    Heart,
    X,
    LogOut,
    Menu,
    User,
    Star,
    MessageCircle,
    Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import components
import Dashboard from "./_component/Dashboard";
import BrowseListings from "./_component/BrowseListings";
import MyRequests from "./_component/MyRequests";
import Notifications from "./_component/Notifications";
import Profile from "./_component/Profile";
import MapView from "./_component/MapView";

const ReceiverDashboard = () => {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: "new_listing", message: "New food listing available 0.5km away", time: "2 min ago", unread: true },
        { id: 2, type: "request_accepted", message: "Your request for vegetables was accepted", time: "1 hour ago", unread: true },
        { id: 3, type: "reminder", message: "Pickup reminder: Fresh bread expires in 2 hours", time: "3 hours ago", unread: false },
    ]);

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Heart },
        { id: "browse", label: "Browse Food", icon: Search },
        { id: "requests", label: "My Requests", icon: Clock },
        { id: "map", label: "Map View", icon: MapPin },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "profile", label: "Profile", icon: User },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case "available":
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Available</Badge>;
            case "requested":
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">Requested</Badge>;
            case "confirmed":
                return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">Confirmed</Badge>;
            case "urgent":
                return <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">Urgent</Badge>;
            case "collected":
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">Collected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const dismissNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard":
                return <Dashboard setActiveSection={setActiveSection} getStatusBadge={getStatusBadge} />;
            case "browse":
                return <BrowseListings getStatusBadge={getStatusBadge} />;
            case "requests":
                return <MyRequests getStatusBadge={getStatusBadge} />;
            case "map":
                return <MapView />;
            case "notifications":
                return <Notifications />;
            case "profile":
                return <Profile />;
            default:
                return <Dashboard setActiveSection={setActiveSection} getStatusBadge={getStatusBadge} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200/50 p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-heading text-lg font-bold text-gray-900">ResQMeal</h1>
                            <p className="font-body text-xs text-gray-600">Receiver Dashboard</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-80 bg-white h-full shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="font-heading text-lg font-bold text-gray-900">ResQMeal</h1>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <nav className="flex-1 p-4 space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const unreadCount = item.id === "notifications" ? notifications.filter(n => n.unread).length : 0;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveSection(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body font-medium text-sm ${activeSection === item.id
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-emerald-700"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="flex-1 text-left">{item.label}</span>
                                        {unreadCount > 0 && (
                                            <Badge className="bg-orange-500 text-white px-2 py-0.5 text-xs">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-200">
                            <Button variant="outline" className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 font-body text-sm">
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-80 bg-white border-r-2 border-gray-200 min-h-screen fixed left-0 top-0 z-40 flex-col shadow-lg">
                    {/* Brand Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                                <Heart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="font-heading text-xl font-bold text-gray-900">ResQMeal</h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-6 space-y-2">
                        <div className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const unreadCount = item.id === "notifications" ? notifications.filter(n => n.unread).length : 0;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body font-medium text-sm ${activeSection === item.id
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-emerald-700 cursor-pointer hover:shadow-lg"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="flex-1 text-left">{item.label}</span>
                                        {unreadCount > 0 && (
                                            <Badge className="bg-orange-500 text-white px-2 py-0.5 text-xs font-medium">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-6 border-t border-gray-200">
                        <Button variant="outline" className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 font-body py-2.5 text-sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-80 min-h-screen bg-gray-100">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReceiverDashboard;
