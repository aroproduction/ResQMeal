import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { createListing, getProviderListings } from '@/services/provider.service';

// POST /api/provider/listings - Create a new listing
export async function POST(request) {
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

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['title', 'foodItems', 'freshness', 'pickupInstructions'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate food items
        if (!Array.isArray(body.foodItems) || body.foodItems.length === 0) {
            return NextResponse.json(
                { error: 'At least one food item is required' },
                { status: 400 }
            );
        }

        for (const item of body.foodItems) {
            if (!item.name || !item.quantity || !item.unit) {
                return NextResponse.json(
                    { error: 'All food items must have name, quantity, and unit' },
                    { status: 400 }
                );
            }
        }

        // Calculate total quantity
        const totalQuantity = body.foodItems.reduce((total, item) => {
            return total + parseFloat(item.quantity || 0);
        }, 0);

        // Prepare listing data
        const listingData = {
            title: body.title,
            description: body.description || '',
            foodItems: body.foodItems,
            totalQuantity,
            unit: body.foodItems[0]?.unit || 'kg', // Use first item's unit as default
            freshness: body.freshness,
            allergens: body.allergens || [],
            dietaryInfo: body.dietaryInfo || [],
            pickupInstructions: body.pickupInstructions,
            photos: body.photos || [],
            providerId: session.user.id,
            // For now, we'll use a default location or the user's location
            // This should be modified to handle actual location selection
            pickupHours: body.pickupHours || '9:00 AM - 6:00 PM'
        };

        const listing = await createListing(listingData);

        return NextResponse.json({
            success: true,
            message: 'Listing created successfully',
            listing
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json(
            { error: 'Failed to create listing', details: error.message },
            { status: 500 }
        );
    }
}

// GET /api/provider/listings - Get all listings for the provider
export async function GET(request) {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Filter by status if provided

        const listings = await getProviderListings(session.user.id, status);

        return NextResponse.json({
            success: true,
            listings
        });

    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listings', details: error.message },
            { status: 500 }
        );
    }
}
