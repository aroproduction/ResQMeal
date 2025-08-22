import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAvailableListings } from '@/services/receiver.service';

// GET /api/receiver/dashboard/recent-listings - Get recent available listings for dashboard
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
        const limit = parseInt(searchParams.get('limit')) || 5;

        const filters = {
            sortBy: 'createdAt',
            order: 'desc'
        };

        const listings = await getAvailableListings(filters);
        
        // Limit results for dashboard
        const limitedListings = listings.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: limitedListings
        });

    } catch (error) {
        console.error('Error fetching recent listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recent listings', details: error.message },
            { status: 500 }
        );
    }
}
