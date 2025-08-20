import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    getProviderClaims,
    updateClaimStatus
} from '@/services/provider.service.js';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const claims = await getProviderClaims(providerId, status);

        return NextResponse.json({
            success: true,
            data: claims
        });
    } catch (error) {
        console.error('Claims API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch claims' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const body = await request.json();
        const { claimId, status, approvedQuantity } = body;

        if (!claimId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: claimId, status' },
                { status: 400 }
            );
        }

        const result = await updateClaimStatus(claimId, providerId, status, approvedQuantity);

        return NextResponse.json({
            success: true,
            data: result.claim
        });
    } catch (error) {
        console.error('Update claim status API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update claim status' },
            { status: 500 }
        );
    }
}
