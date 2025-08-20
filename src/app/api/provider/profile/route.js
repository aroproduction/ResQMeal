import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProviderProfile, updateProviderProfile } from '@/services/provider.service';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const profileData = await getProviderProfile(session.user.id);
        return NextResponse.json(profileData);

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const result = await updateProviderProfile(session.user.id, body);

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
