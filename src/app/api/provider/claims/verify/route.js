import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyPickupCode } from '@/services/provider.service.js';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const body = await request.json();
        const { claimId, code } = body;

        if (!claimId || !code) {
            return NextResponse.json(
                { error: 'Missing required fields: claimId, code' },
                { status: 400 }
            );
        }

        const result = await verifyPickupCode(claimId, providerId, code);

        return NextResponse.json({
            success: true,
            message: 'Pickup code verified successfully',
            data: result.claim
        });
    } catch (error) {
        console.error('Verify pickup code API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify pickup code' },
            { status: error.message === 'Invalid pickup code' ? 400 : 500 }
        );
    }
}
