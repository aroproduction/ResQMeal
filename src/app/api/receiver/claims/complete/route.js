import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateReceiverClaim } from '@/services/receiver.service';

// POST /api/receiver/claims/complete - Mark claim as completed with feedback
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
        const { claimId, feedback } = body;

        if (!claimId) {
            return NextResponse.json(
                { error: 'Missing required field: claimId' },
                { status: 400 }
            );
        }

        if (feedback && (!feedback.rating || feedback.rating < 1 || feedback.rating > 5)) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const updates = {
            status: 'COMPLETED',
            feedback
        };

        const result = await updateReceiverClaim(claimId, session.user.id, updates);

        return NextResponse.json({
            success: true,
            message: 'Claim completed successfully',
            data: result
        });

    } catch (error) {
        console.error('Error completing claim:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to complete claim' },
            { status: 500 }
        );
    }
}
