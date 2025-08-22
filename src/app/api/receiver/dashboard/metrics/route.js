import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getReceiverDashboardMetrics, getReceiverActivity } from '@/services/receiver.service';

// GET /api/receiver/dashboard/metrics - Get receiver dashboard metrics
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

        const receiverId = session.user.id;

        // Get metrics and recent activity in parallel
        const [metrics, recentActivity] = await Promise.all([
            getReceiverDashboardMetrics(receiverId),
            getReceiverActivity(receiverId, 5) // Get last 5 activities
        ]);

        return NextResponse.json({
            success: true,
            data: {
                ...metrics,
                recentActivity,
                organizationName: session.user.name || 'Receiver'
            }
        });

    } catch (error) {
        console.error('Error fetching receiver dashboard metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard metrics', details: error.message },
            { status: 500 }
        );
    }
}
