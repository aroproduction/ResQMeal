import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateReceiverSustainabilityScore } from '@/services/receiver.service';

// POST /api/receiver/analytics - Update receiver analytics
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
        const { foodReceivedKg } = body;

        if (!foodReceivedKg || foodReceivedKg <= 0) {
            return NextResponse.json(
                { error: 'Invalid food amount' },
                { status: 400 }
            );
        }

        const result = await updateReceiverSustainabilityScore(session.user.id, foodReceivedKg);

        return NextResponse.json({
            success: true,
            message: 'Analytics updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating receiver analytics:', error);
        return NextResponse.json(
            { error: 'Failed to update analytics', details: error.message },
            { status: 500 }
        );
    }
}
