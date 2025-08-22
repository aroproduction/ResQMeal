import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/receiver/notifications - Get notifications for receiver
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

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const limit = parseInt(searchParams.get('limit')) || 20;

        const whereClause = { userId: session.user.id };
        if (unreadOnly) {
            whereClause.readAt = null;
        }

        const notifications = await prisma.notificationLog.findMany({
            where: whereClause,
            orderBy: { sentAt: 'desc' },
            take: limit
        });

        // Get unread count
        const unreadCount = await prisma.notificationLog.count({
            where: {
                userId: session.user.id,
                readAt: null
            }
        });

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/receiver/notifications - Mark notifications as read
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
        const { notificationIds, markAllAsRead } = body;

        if (markAllAsRead) {
            // Mark all notifications as read
            await prisma.notificationLog.updateMany({
                where: {
                    userId: session.user.id,
                    readAt: null
                },
                data: {
                    readAt: new Date()
                }
            });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await prisma.notificationLog.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: session.user.id
                },
                data: {
                    readAt: new Date()
                }
            });
        } else {
            return NextResponse.json(
                { error: 'Either notificationIds array or markAllAsRead flag is required' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notifications marked as read'
        });

    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications', details: error.message },
            { status: 500 }
        );
    }
}
