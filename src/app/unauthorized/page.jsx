"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleGoHome = () => {
        if (session?.user?.role === "PROVIDER") {
            router.push("/provider");
        } else if (session?.user?.role === "RECEIVER") {
            router.push("/receiver");
        } else if (session?.user?.role === "ADMIN") {
            router.push("/admin");
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-red-600">
                        Access Denied
                    </CardTitle>
                    <CardDescription>
                        You don't have permission to access this page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-gray-600">
                        <p>Your current role: <strong>{session?.user?.role || "Not logged in"}</strong></p>
                        <p className="mt-2">You are not authorized to view this content.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleGoHome}
                            className="flex-1"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="flex-1"
                        >
                            Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
