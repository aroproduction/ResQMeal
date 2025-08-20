import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findClaimByEmail } from '@/services/provider.service.js';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        const claim = await findClaimByEmail(providerId, email);

        if (!claim) {
            return NextResponse.json(
                { error: 'No active claim found for this email' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: claim
        });
    } catch (error) {
        console.error('Find claim by email API error:', error);
        return NextResponse.json(
            { error: 'Failed to find claim' },
            { status: 500 }
        );
    }
}
