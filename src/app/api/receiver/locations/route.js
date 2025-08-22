import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/receiver/locations - Get available locations with active listings
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

        // Get all locations that have active listings
        const locations = await prisma.location.findMany({
            where: {
                listings: {
                    some: {
                        status: 'AVAILABLE',
                        availableUntil: { gt: new Date() },
                        safeUntil: { gt: new Date() }
                    }
                }
            },
            include: {
                campus: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                _count: {
                    select: {
                        listings: {
                            where: {
                                status: 'AVAILABLE',
                                availableUntil: { gt: new Date() },
                                safeUntil: { gt: new Date() }
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const formattedLocations = locations.map(location => ({
            id: location.id,
            name: location.name,
            type: location.type,
            coordinates: location.coordinates,
            contactInfo: location.contactInfo,
            operatingHours: location.operatingHours,
            campus: location.campus,
            activeListingsCount: location._count.listings
        }));

        return NextResponse.json({
            success: true,
            data: formattedLocations
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch locations', details: error.message },
            { status: 500 }
        );
    }
}
