import React from "react";
import { Bell, ClipboardList, AlertCircle, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Notifications = ({ notifications, dismissNotification }) => {
    return (
        <div className="space-y-6">
            <Card className="bg-white shadow-lg border-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-200/20 p-8">
                    <CardTitle className="font-heading text-2xl text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Bell className="w-6 h-6 text-emerald-600" />
                        </div>
                        All Notifications
                        {notifications.filter(n => n.unread).length > 0 && (
                            <Badge className="bg-orange-100 text-orange-700 ml-auto">
                                {notifications.filter(n => n.unread).length} unread
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-8">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${notification.unread
                                ? "bg-emerald-50/80 border-emerald-200"
                                : "bg-gray-50/80 border-gray-200"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {notification.type === "request" && (
                                            <ClipboardList className="w-4 h-4 text-emerald-600" />
                                        )}
                                        {notification.type === "expired" && (
                                            <AlertCircle className="w-4 h-4 text-orange-600" />
                                        )}
                                        {notification.type === "success" && (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        )}
                                        {notification.unread && (
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        )}
                                    </div>
                                    <p className="font-body text-sm text-gray-900 mb-1">{notification.message}</p>
                                    <p className="font-body text-xs text-gray-500">{notification.time}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    onClick={() => dismissNotification(notification.id)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default Notifications;
