import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateSustainabilityScore } from '@/services/provider.service';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { foodSharedKg } = body;

        if (!foodSharedKg || foodSharedKg <= 0) {
            return NextResponse.json(
                { error: 'Invalid food amount' },
                { status: 400 }
            );
        }

        const result = await updateSustainabilityScore(session.user.id, foodSharedKg);

        return NextResponse.json({
            success: true,
            message: 'Analytics updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating analytics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
