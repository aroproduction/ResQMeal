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
        // Get only active (non-expired) listings
        const activeListings = await getProviderListings(providerId, 'AVAILABLE,PARTIALLY_CLAIMED');

        // Filter to only include non-expired listings
        const filteredListings = activeListings.filter(listing => !listing.isExpired);

        return NextResponse.json({
            success: true,
            data: filteredListings
        });
    } catch (error) {
        console.error('Active listings API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active listings' },
            { status: 500 }
        );
    }
}
