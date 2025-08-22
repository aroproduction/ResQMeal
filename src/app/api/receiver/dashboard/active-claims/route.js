import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getReceiverClaims } from '@/services/receiver.service';

// GET /api/receiver/dashboard/active-claims - Get active claims for dashboard
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

        // Get active claims (pending, approved, confirmed)
        const activeClaims = await getReceiverClaims(session.user.id);
        
        // Filter only active statuses and limit results
        const activeStatuses = ['PENDING', 'APPROVED', 'CONFIRMED'];
        const filteredClaims = activeClaims
            .filter(claim => activeStatuses.includes(claim.status))
            .slice(0, limit);

        return NextResponse.json({
            success: true,
            data: filteredClaims
        });

    } catch (error) {
        console.error('Error fetching active claims:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active claims', details: error.message },
            { status: 500 }
        );
    }
}
