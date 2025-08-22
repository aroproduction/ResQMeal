import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateReceiverClaim, cancelClaim } from '@/services/receiver.service';
import { prisma } from '@/lib/db';

// GET /api/receiver/claims/[id] - Get specific claim details
export async function GET(request, { params }) {
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

        const claimId = (await params).id;

        const claim = await prisma.claim.findFirst({
            where: {
                id: claimId,
                receiverId: session.user.id
            },
            include: {
                listing: {
                    include: {
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                providerDetails: {
                                    select: {
                                        businessName: true
                                    }
                                }
                            }
                        },
                        location: {
                            select: {
                                name: true,
                                coordinates: true,
                                contactInfo: true
                            }
                        }
                    }
                },
                feedback: true
            }
        });

        if (!claim) {
            return NextResponse.json(
                { error: 'Claim not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: claim
        });

    } catch (error) {
        console.error('Error fetching claim details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch claim details', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/receiver/claims/[id] - Update specific claim
export async function PUT(request, { params }) {
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

        const claimId = (await params).id;
        const body = await request.json();
        const { status, actualPickupTime, feedback, cancelReason } = body;

        let result;

        if (status === 'CANCELLED') {
            result = await cancelClaim(claimId, session.user.id, cancelReason);
        } else {
            const updates = {
                status,
                actualPickupTime,
                feedback
            };
            result = await updateReceiverClaim(claimId, session.user.id, updates);
        }

        return NextResponse.json({
            success: true,
            message: 'Claim updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating claim:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update claim' },
            { status: 500 }
        );
    }
}
