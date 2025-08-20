import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTTLStats } from '@/lib/ttl-service.js';
import { getProviderBusinessName, getProviderDashboardMetrics } from '@/services/provider.service.js';
import { prisma } from '@/lib/db.js';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;

        if (!providerId) {
            return NextResponse.json({ error: 'Provider ID not found in session' }, { status: 400 });
        }

        // Get TTL stats, business name, and real metrics in parallel
        const [ttlStats, businessName, realMetrics] = await Promise.all([
            getTTLStats(providerId),
            getProviderBusinessName(providerId),
            getProviderDashboardMetrics(providerId)
        ]);

        // Get additional rating details
        const feedbackDetails = await prisma.claimFeedback.findMany({
            where: {
                claim: {
                    listing: {
                        providerId
                    }
                }
            },
            select: {
                rating: true,
                foodQuality: true,
                experience: true,
                comment: true,
                claim: {
                    select: {
                        createdAt: true
                    }
                }
            },
            orderBy: {
                claim: {
                    createdAt: 'desc'
                }
            },
            take: 10 // Last 10 feedback entries
        });

        // Calculate rating breakdown
        const ratingBreakdown = {
            totalReviews: feedbackDetails.length,
            averageRating: realMetrics.rating,
            averageFoodQuality: feedbackDetails.length > 0
                ? Math.round((feedbackDetails.reduce((sum, f) => sum + (f.foodQuality || 0), 0) / feedbackDetails.length) * 10) / 10
                : 0,
            averageExperience: feedbackDetails.length > 0
                ? Math.round((feedbackDetails.reduce((sum, f) => sum + (f.experience || 0), 0) / feedbackDetails.length) * 10) / 10
                : 0,
            recentComments: feedbackDetails
                .filter(f => f.comment && f.comment.trim().length > 0)
                .slice(0, 3)
                .map(f => ({
                    comment: f.comment,
                    rating: f.rating,
                    date: f.claim.createdAt
                }))
        };

        // Format metrics for dashboard, using real data where available
        const metrics = {
            activeListings: realMetrics.activeListings || ttlStats.activeListings,
            peopleServed: realMetrics.peopleServed || Math.floor(ttlStats.totalClaimed * 2), // Use real data or fallback
            co2Reduced: realMetrics.co2Reduced || `${(ttlStats.totalClaimed * 2.5).toFixed(1)}kg`, // Use real calculation or estimate
            rating: realMetrics.rating, // Always use real rating from feedback
            businessName: businessName || 'Provider',
            totalFoodSharedKg: realMetrics.totalFoodSharedKg || ttlStats.totalClaimed,
            // Enhanced rating information
            ratingDetails: ratingBreakdown,
            // Additional TTL metrics
            totalWasted: ttlStats.totalWasted,
            wasteRate: ttlStats.wasteRate,
            todayExpired: ttlStats.todayExpired,
            totalListings: ttlStats.totalListings,
            expiredListings: ttlStats.expiredListings
        };

        return NextResponse.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Dashboard metrics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard metrics' },
            { status: 500 }
        );
    }
}
