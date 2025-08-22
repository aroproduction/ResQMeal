import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getReceiverProfile, updateReceiverProfile } from '@/services/receiver.service';

// GET /api/receiver/profile - Get receiver profile
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

        const profile = await getReceiverProfile(session.user.id);

        return NextResponse.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Error fetching receiver profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/receiver/profile - Update receiver profile
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
        const updatedProfile = await updateReceiverProfile(session.user.id, body);

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error updating receiver profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}
