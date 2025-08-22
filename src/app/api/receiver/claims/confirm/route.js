import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateReceiverClaim } from '@/services/receiver.service';

// POST /api/receiver/claims/confirm - Confirm pickup for an approved claim
export async function POST(request) {
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

        const body = await request.json();
        const { claimId, pickupTime } = body;

        if (!claimId) {
            return NextResponse.json(
                { error: 'Missing required field: claimId' },
                { status: 400 }
            );
        }

        const updates = {
            status: 'CONFIRMED',
            actualPickupTime: pickupTime ? new Date(pickupTime) : new Date()
        };

        const result = await updateReceiverClaim(claimId, session.user.id, updates);

        return NextResponse.json({
            success: true,
            message: 'Pickup confirmed successfully',
            data: result
        });

    } catch (error) {
        console.error('Error confirming pickup:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to confirm pickup' },
            { status: 500 }
        );
    }
}
