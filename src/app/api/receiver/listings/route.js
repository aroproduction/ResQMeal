import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAvailableListings } from '@/services/receiver.service';

// GET /api/receiver/listings - Get available listings for receivers
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'RECEIVER') {
            return NextResponse.json(
                { error: 'Forbidden - Receiver access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const freshness = searchParams.get('freshness');
        const locationId = searchParams.get('locationId');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const order = searchParams.get('order') || 'desc';

        const filters = {
            search,
            freshness,
            locationId,
            sortBy,
            order
        };

        const listings = await getAvailableListings(filters);

        return NextResponse.json({
            success: true,
            data: listings
        });

    } catch (error) {
        console.error('Error fetching available listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listings', details: error.message },
            { status: 500 }
        );
    }
}
