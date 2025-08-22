import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/receiver/listings/[id] - Get specific listing details for receiver
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

        const listingId = (await params).id;

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                avatar: true
                            }
                        },
                        providerDetails: {
                            select: {
                                businessName: true
                            }
                        }
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        coordinates: true,
                        contactInfo: true,
                        operatingHours: true
                    }
                },
                claims: {
                    select: {
                        id: true,
                        requestedQuantity: true,
                        approvedQuantity: true,
                        status: true,
                        receiverId: true
                    }
                },
                analytics: {
                    select: {
                        viewCount: true,
                        claimCount: true,
                        shareCount: true
                    }
                }
            }
        });

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        // Check if listing is available
        if (listing.status !== 'AVAILABLE') {
            return NextResponse.json(
                { error: 'Listing is not available' },
                { status: 400 }
            );
        }

        // Calculate remaining quantity
        const totalClaimedQuantity = listing.claims
            .filter(claim => ['PENDING', 'APPROVED', 'CONFIRMED', 'COMPLETED'].includes(claim.status))
            .reduce((total, claim) => total + (claim.approvedQuantity || claim.requestedQuantity), 0);

        const remainingQuantity = listing.totalQuantity - totalClaimedQuantity;

        // Check if user has already claimed this listing
        const userClaim = listing.claims.find(claim => 
            claim.receiverId === session.user.id && 
            ['PENDING', 'APPROVED', 'CONFIRMED'].includes(claim.status)
        );

        // Calculate time remaining
        const timeRemaining = Math.ceil((new Date(listing.safeUntil) - new Date()) / (1000 * 60 * 60)); // hours

        // Update view count
        await prisma.listingAnalytics.upsert({
            where: { listingId },
            update: {
                viewCount: { increment: 1 }
            },
            create: {
                listingId,
                viewCount: 1
            }
        });

        const responseData = {
            ...listing,
            remainingQuantity,
            timeRemaining,
            userHasClaimed: !!userClaim,
            userClaimId: userClaim?.id || null,
            provider: {
                ...listing.provider,
                displayName: listing.provider.providerDetails?.businessName || listing.provider.name
            },
            // Remove sensitive claim data
            claims: listing.claims.map(claim => ({
                id: claim.id,
                requestedQuantity: claim.requestedQuantity,
                approvedQuantity: claim.approvedQuantity,
                status: claim.status,
                isUserClaim: claim.receiverId === session.user.id
            }))
        };

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching listing details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listing details', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/receiver/listings/[id] - Create a claim for this listing
export async function POST(request, { params }) {
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

        const listingId = (await params).id;
        const body = await request.json();
        const { requestedQuantity, notes } = body;

        if (!requestedQuantity || requestedQuantity <= 0) {
            return NextResponse.json(
                { error: 'Invalid requested quantity' },
                { status: 400 }
            );
        }

        // Import createClaim function
        const { createClaim } = await import('@/services/receiver.service');

        const claimData = {
            listingId,
            receiverId: session.user.id,
            requestedQuantity: parseFloat(requestedQuantity),
            notes
        };

        const claim = await createClaim(claimData);

        return NextResponse.json({
            success: true,
            message: 'Claim created successfully',
            data: claim
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating claim:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create claim' },
            { status: 500 }
        );
    }
}
