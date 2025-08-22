import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
    createClaim, 
    getReceiverClaims, 
    updateReceiverClaim, 
    cancelClaim 
} from '@/services/receiver.service';

// GET /api/receiver/claims - Get claims made by the receiver
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
        const status = searchParams.get('status');

        const claims = await getReceiverClaims(session.user.id, status);

        return NextResponse.json({
            success: true,
            data: claims
        });

    } catch (error) {
        console.error('Error fetching receiver claims:', error);
        return NextResponse.json(
            { error: 'Failed to fetch claims', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/receiver/claims - Create a new claim
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
        const { listingId, requestedQuantity, notes } = body;

        // Validate required fields
        if (!listingId || !requestedQuantity) {
            return NextResponse.json(
                { error: 'Missing required fields: listingId, requestedQuantity' },
                { status: 400 }
            );
        }

        if (requestedQuantity <= 0) {
            return NextResponse.json(
                { error: 'Requested quantity must be greater than 0' },
                { status: 400 }
            );
        }

        const claimData = {
            listingId,
            receiverId: session.user.id,
            requestedQuantity: parseFloat(requestedQuantity),
            notes
        };

        const claim = await createClaim(claimData);

        return NextResponse.json({
            success: true,
            message: 'Claim created successfully',
            data: claim
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating claim:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create claim' },
            { status: 500 }
        );
    }
}

// PUT /api/receiver/claims - Update a claim
export async function PUT(request) {
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
        const { claimId, status, actualPickupTime, feedback, cancelReason } = body;

        if (!claimId) {
            return NextResponse.json(
                { error: 'Missing required field: claimId' },
                { status: 400 }
            );
        }

        let result;

        if (status === 'CANCELLED') {
            result = await cancelClaim(claimId, session.user.id, cancelReason);
        } else {
            const updates = {
                status,
                actualPickupTime,
                feedback
            };
            result = await updateReceiverClaim(claimId, session.user.id, updates);
        }

        return NextResponse.json({
            success: true,
            message: 'Claim updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating claim:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update claim' },
            { status: 500 }
        );
    }
}
