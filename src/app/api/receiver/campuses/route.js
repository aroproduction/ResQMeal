import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/receiver/campuses - Get available campuses for receiver profile
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

        const campuses = await prisma.campus.findMany({
            select: {
                id: true,
                name: true,
                address: true,
                coordinates: true,
                timezone: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: campuses
        });

    } catch (error) {
        console.error('Error fetching campuses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campuses', details: error.message },
            { status: 500 }
        );
    }
}
