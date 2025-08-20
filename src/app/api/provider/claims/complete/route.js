import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { completeDelivery } from '@/services/provider.service.js';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const body = await request.json();
        const { claimId } = body;

        if (!claimId) {
            return NextResponse.json(
                { error: 'Missing required field: claimId' },
                { status: 400 }
            );
        }

        const result = await completeDelivery(claimId, providerId);

        return NextResponse.json({
            success: true,
            message: 'Delivery completed successfully',
            data: result.claim
        });
    } catch (error) {
        console.error('Complete delivery API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to complete delivery' },
            { status: 500 }
        );
    }
}
