import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProviderListings } from '@/services/provider.service.js';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        // Get completed and expired listings
        const allListings = await getProviderListings(providerId);

        // Filter to only include completed or expired listings
        const pastListings = allListings.filter(listing =>
            listing.status === 'completed' ||
            listing.status === 'expired' ||
            listing.status === 'cancelled' ||
            listing.isExpired
        );

        // Format for past listings display
        const formattedListings = pastListings.map(listing => ({
            id: listing.id,
            name: listing.title,
            quantity: `${listing.totalQuantity} ${listing.unit}`,
            completedDate: listing.isExpired ?
                listing.updatedAt?.toLocaleDateString() :
                listing.updatedAt?.toLocaleDateString(),
            recipient: listing.claimedQuantity > 0 ? 'Multiple Recipients' : 'None',
            category: 'General', // Could be derived from foodItems
            claimedQuantity: listing.claimedQuantity,
            wastedQuantity: listing.wastedQuantity || 0,
            completionRate: listing.completionRate,
            status: listing.isExpired ? 'expired' : listing.status
        }));

        return NextResponse.json({
            success: true,
            data: formattedListings
        });
    } catch (error) {
        console.error('Past listings API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch past listings' },
            { status: 500 }
        );
    }
}
