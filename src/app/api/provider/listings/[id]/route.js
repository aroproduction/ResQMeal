import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { deleteListing, updateListingStatus } from '@/services/provider.service';
import { prisma } from '@/lib/db.js';

// GET /api/provider/listings/[id] - Get a specific listing
export async function GET(request, { params }) {
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

        const { id } = await params;

        const listing = await prisma.listing.findFirst({
            where: {
                id,
                providerId: session.user.id
            },
            include: {
                location: true,
                claims: {
                    include: {
                        receiver: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
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

        return NextResponse.json({
            success: true,
            listing
        });

    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listing', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/provider/listings/[id] - Update listing
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

        // Find the listing first to ensure it belongs to the provider
        const existingListing = await prisma.listing.findFirst({
            where: {
                id,
                providerId: session.user.id
            }
        });

        if (!existingListing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        // Build update data object
        const updateData = {};

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.pickupInstructions !== undefined) updateData.pickupInstructions = body.pickupInstructions;
        if (body.status !== undefined) {
            const allowedStatuses = ['AVAILABLE', 'PARTIALLY_CLAIMED', 'FULLY_CLAIMED', 'COMPLETED', 'EXPIRED', 'CANCELLED'];
            if (!allowedStatuses.includes(body.status.toUpperCase())) {
                return NextResponse.json(
                    { error: 'Invalid status' },
                    { status: 400 }
                );
            }
            updateData.status = body.status.toUpperCase();
        }

        const updatedListing = await prisma.listing.update({
            where: { id },
            data: updateData,
            include: {
                location: true,
                claims: {
                    include: {
                        receiver: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Listing updated successfully',
            listing: updatedListing
        });

    } catch (error) {
        console.error('Error updating listing:', error);
        return NextResponse.json(
            { error: 'Failed to update listing', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/provider/listings/[id] - Delete a listing
export async function DELETE(request, { params }) {
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

        await deleteListing(id, session.user.id);

        return NextResponse.json({
            success: true,
            message: 'Listing deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json(
            { error: 'Failed to delete listing', details: error.message },
            { status: 500 }
        );
    }
}
