import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { prisma } from '@/lib/db.js';
import { updateListingClaimedQuantity } from '@/lib/ttl-service.js';

// POST /api/provider/claims/[id]/approve - Approve a claim
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'PROVIDER' && session.user.role !== 'CANTEEN_MANAGER') {
            return NextResponse.json(
                { error: 'Forbidden - Provider access required' },
                { status: 403 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { approvedQuantity } = body;

        // Find the claim and verify it belongs to the provider
        const claim = await prisma.claim.findFirst({
            where: {
                id,
                listing: {
                    providerId: session.user.id
                }
            },
            include: {
                listing: true
            }
        });

        if (!claim) {
            return NextResponse.json(
                { error: 'Claim not found' },
                { status: 404 }
            );
        }

        if (claim.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Claim is not pending approval' },
                { status: 400 }
            );
        }

        // Update the claim
        const updatedClaim = await prisma.claim.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedQuantity: approvedQuantity || claim.requestedQuantity,
                updatedAt: new Date()
            }
        });

        // Update the listing's claimed quantity and status using TTL service
        await updateListingClaimedQuantity(claim.listingId);

        return NextResponse.json({
            success: true,
            message: 'Claim approved successfully',
            claim: updatedClaim
        });

    } catch (error) {
        console.error('Error approving claim:', error);
        return NextResponse.json(
            { error: 'Failed to approve claim', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/provider/claims/[id]/reject - Reject a claim
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'PROVIDER' && session.user.role !== 'CANTEEN_MANAGER') {
            return NextResponse.json(
                { error: 'Forbidden - Provider access required' },
                { status: 403 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { reason } = body;

        // Find the claim and verify it belongs to the provider
        const claim = await prisma.claim.findFirst({
            where: {
                id,
                listing: {
                    providerId: session.user.id
                }
            }
        });

        if (!claim) {
            return NextResponse.json(
                { error: 'Claim not found' },
                { status: 404 }
            );
        }

        if (claim.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Claim is not pending approval' },
                { status: 400 }
            );
        }

        // Update the claim
        const updatedClaim = await prisma.claim.update({
            where: { id },
            data: {
                status: 'REJECTED',
                cancelReason: reason,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Claim rejected successfully',
            claim: updatedClaim
        });

    } catch (error) {
        console.error('Error rejecting claim:', error);
        return NextResponse.json(
            { error: 'Failed to reject claim', details: error.message },
            { status: 500 }
        );
    }
}
