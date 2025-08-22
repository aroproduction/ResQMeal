import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAvailableListings } from '@/services/receiver.service';

// GET /api/receiver/listings/search - Search and filter available listings
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
        
        const filters = {
            search: searchParams.get('q') || searchParams.get('search'),
            freshness: searchParams.get('freshness'),
            locationId: searchParams.get('locationId'),
            sortBy: searchParams.get('sortBy') || 'createdAt',
            order: searchParams.get('order') || 'desc'
        };

        // Additional filters for search
        const minQuantity = searchParams.get('minQuantity');
        const maxQuantity = searchParams.get('maxQuantity');
        const priority = searchParams.get('priority');
        const allergens = searchParams.get('allergens');
        const dietaryInfo = searchParams.get('dietaryInfo');

        const listings = await getAvailableListings(filters);

        // Apply additional client-side filters
        let filteredListings = listings;

        if (minQuantity) {
            filteredListings = filteredListings.filter(listing => 
                listing.remainingQuantity >= parseFloat(minQuantity)
            );
        }

        if (maxQuantity) {
            filteredListings = filteredListings.filter(listing => 
                listing.remainingQuantity <= parseFloat(maxQuantity)
            );
        }

        if (priority) {
            filteredListings = filteredListings.filter(listing => 
                listing.priority === priority.toUpperCase()
            );
        }

        if (allergens) {
            const allergensList = allergens.split(',').map(a => a.trim().toLowerCase());
            filteredListings = filteredListings.filter(listing => {
                const listingAllergens = (listing.allergens || []).map(a => a.toLowerCase());
                return !allergensList.some(allergen => listingAllergens.includes(allergen));
            });
        }

        if (dietaryInfo) {
            const dietaryList = dietaryInfo.split(',').map(d => d.trim().toLowerCase());
            filteredListings = filteredListings.filter(listing => {
                const listingDietary = (listing.dietaryInfo || []).map(d => d.toLowerCase());
                return dietaryList.every(dietary => listingDietary.includes(dietary));
            });
        }

        return NextResponse.json({
            success: true,
            data: filteredListings,
            total: filteredListings.length,
            filters: {
                search: filters.search,
                freshness: filters.freshness,
                locationId: filters.locationId,
                sortBy: filters.sortBy,
                order: filters.order,
                minQuantity,
                maxQuantity,
                priority,
                allergens,
                dietaryInfo
            }
        });

    } catch (error) {
        console.error('Error searching listings:', error);
        return NextResponse.json(
            { error: 'Failed to search listings', details: error.message },
            { status: 500 }
        );
    }
}
