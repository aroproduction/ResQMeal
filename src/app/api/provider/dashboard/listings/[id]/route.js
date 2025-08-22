import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateListingStatus, deleteListing } from '@/services/provider.service.js';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const listingId = (await params).id;
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updatedListing = await updateListingStatus(listingId, status, providerId);

        return NextResponse.json({
            success: true,
            data: updatedListing
        });
    } catch (error) {
        console.error('Update listing API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update listing' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const listingId = (await params).id;

        await deleteListing(listingId, providerId);

        return NextResponse.json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        console.error('Delete listing API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete listing' },
            { status: 500 }
        );
    }
}
