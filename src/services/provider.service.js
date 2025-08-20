import { prisma } from '@/lib/db.js';
import { getListingsWithTTL, updateListingClaimedQuantity } from '@/lib/ttl-service.js';
import {
    calculateCO2Reduction,
    calculateWaterSaved,
    convertToKg,
    calculatePeopleServed
} from '@/lib/environmental-impact.js';

/**
 * Create a new food listing
 */
export const createListing = async (listingData) => {
    try {
        // Get or create a default campus
        let campus = await prisma.campus.findFirst({
            where: {
                name: 'Default Campus'
            }
        });

        if (!campus) {
            campus = await prisma.campus.create({
                data: {
                    name: 'Default Campus',
                    address: { street: 'Default Address', city: 'Default City' },
                    coordinates: { lat: 0, lng: 0 }
                }
            });
        }

        // Get or create a default location for the provider
        let location = await prisma.location.findFirst({
            where: {
                name: 'Default Provider Location',
                type: 'OTHER',
                campusId: campus.id
            }
        });

        if (!location) {
            location = await prisma.location.create({
                data: {
                    campusId: campus.id,
                    name: 'Default Provider Location',
                    type: 'OTHER',
                    coordinates: { lat: 0, lng: 0 },
                    contactInfo: { phone: '', email: '' },
                    operatingHours: {
                        monday: '9:00-18:00',
                        tuesday: '9:00-18:00',
                        wednesday: '9:00-18:00',
                        thursday: '9:00-18:00',
                        friday: '9:00-18:00',
                        saturday: '9:00-18:00',
                        sunday: '9:00-18:00'
                    }
                }
            });
        }

        // Calculate availability times
        const availableFrom = new Date();
        const availableUntil = new Date();
        availableUntil.setHours(availableUntil.getHours() + 12); // Default 12 hours availability

        // Calculate safe until time based on freshness
        const safeUntil = new Date();
        switch (listingData.freshness) {
            case 'FRESHLY_COOKED':
                safeUntil.setHours(safeUntil.getHours() + 4);
                break;
            case 'FRESH':
                safeUntil.setHours(safeUntil.getHours() + 8);
                break;
            case 'GOOD':
                safeUntil.setHours(safeUntil.getHours() + 12);
                break;
            case 'NEAR_EXPIRY':
                safeUntil.setHours(safeUntil.getHours() + 2);
                break;
            case 'USE_IMMEDIATELY':
                safeUntil.setHours(safeUntil.getHours() + 1);
                break;
            default:
                safeUntil.setHours(safeUntil.getHours() + 6);
        }

        // Determine priority based on freshness and expiry time
        let priority = 'MEDIUM';
        const hoursUntilExpiry = (safeUntil - new Date()) / (1000 * 60 * 60);
        if (hoursUntilExpiry <= 2) {
            priority = 'URGENT';
        } else if (hoursUntilExpiry <= 4) {
            priority = 'HIGH';
        } else if (listingData.freshness === 'FRESHLY_COOKED') {
            priority = 'HIGH';
        }

        const listing = await prisma.listing.create({
            data: {
                title: listingData.title,
                description: listingData.description,
                foodItems: listingData.foodItems,
                totalQuantity: listingData.totalQuantity,
                unit: listingData.unit,
                freshness: listingData.freshness,
                allergens: listingData.allergens,
                dietaryInfo: listingData.dietaryInfo,
                safeUntil,
                availableFrom,
                availableUntil,
                pickupInstructions: listingData.pickupInstructions,
                photos: listingData.photos,
                providerId: listingData.providerId,
                locationId: location.id,
                priority,
                status: 'AVAILABLE'
            },
            include: {
                provider: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                location: true
            }
        });

        return listing;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
};

/**
 * Get all listings for a provider
 */
export const getProviderListings = async (providerId, status = null) => {
    try {
        const filters = { providerId };
        if (status) {
            filters.status = status.toUpperCase();
        }

        // Use TTL service to get listings with automatic expiry handling
        const listings = await getListingsWithTTL(filters);

        return listings.map(listing => ({
            id: listing.id,
            name: listing.title,
            title: listing.title,
            description: listing.description,
            foodItems: listing.foodItems,
            totalQuantity: listing.totalQuantity,
            unit: listing.unit,
            freshness: listing.freshness,
            allergens: listing.allergens,
            dietaryInfo: listing.dietaryInfo,
            expiry: listing.timeUntilExpiry,
            expiryText: listing.timeUntilExpiry,
            status: listing.status.toLowerCase(),
            priority: listing.priority.toLowerCase(),
            claims: listing._count.claims,
            claimedQuantity: listing.claimedQuantity,
            remainingQuantity: listing.remainingQuantity,
            completionRate: listing.completionRate,
            isExpired: listing.isExpired,
            wastedQuantity: listing.wastedQuantity,
            location: listing.location?.name || 'Unknown Location',
            pickupInstructions: listing.pickupInstructions,
            photos: listing.photos,
            safeUntil: listing.safeUntil,
            availableFrom: listing.availableFrom,
            availableUntil: listing.availableUntil,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt
        }));

    } catch (error) {
        console.error('Error fetching provider listings:', error);
        throw error;
    }
};

/**
 * Get provider dashboard metrics
 */
export const getProviderDashboardMetrics = async (providerId) => {
    try {
        // Get active listings count
        const activeListings = await prisma.listing.count({
            where: {
                providerId,
                status: {
                    in: ['AVAILABLE', 'PARTIALLY_CLAIMED']
                }
            }
        });

        // Get total people served from completed claims
        const completedClaims = await prisma.claim.findMany({
            where: {
                listing: {
                    providerId
                },
                status: 'COMPLETED'
            },
            include: {
                listing: true
            }
        });

        let totalPeopleServed = 0;
        let totalFoodServedKg = 0;

        completedClaims.forEach(claim => {
            if (claim.approvedQuantity) {
                const quantityInKg = convertToKg(claim.approvedQuantity, claim.listing.unit);
                totalFoodServedKg += quantityInKg;

                // Calculate people served based on the specific food and quantity
                const peopleFromThisListing = calculatePeopleServed(claim.approvedQuantity, claim.listing.unit);
                totalPeopleServed += peopleFromThisListing;
            }
        });

        // Calculate CO2 reduction using advanced calculation
        const co2Reduced = calculateCO2Reduction('prepared', totalFoodServedKg, 'kg');

        // Get average rating from feedback
        const feedbackData = await prisma.claimFeedback.findMany({
            where: {
                claim: {
                    listing: {
                        providerId
                    }
                }
            }
        });

        let averageRating = 0;
        if (feedbackData.length > 0) {
            const totalRating = feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0);
            averageRating = Math.round((totalRating / feedbackData.length) * 10) / 10;
        }

        return {
            activeListings,
            peopleServed: totalPeopleServed,
            co2Reduced: `${co2Reduced}kg`,
            rating: averageRating || 0,
            totalFoodSharedKg: Math.round(totalFoodServedKg * 100) / 100
        };
    } catch (error) {
        console.error('Error fetching provider dashboard metrics:', error);
        throw error;
    }
};

/**
 * Get provider's active listings with claims count
 */
export const getProviderActiveListings = async (providerId) => {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                providerId,
                status: {
                    in: ['AVAILABLE', 'PARTIALLY_CLAIMED', 'FULLY_CLAIMED']
                }
            },
            include: {
                claims: {
                    where: {
                        status: {
                            in: ['PENDING', 'APPROVED', 'CONFIRMED']
                        }
                    }
                },
                location: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return listings.map(listing => {
            const timeUntilExpiry = new Date(listing.safeUntil) - new Date();
            const hoursUntilExpiry = Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60 * 60)));

            let expiryText;
            if (hoursUntilExpiry === 0) {
                expiryText = 'Expired';
            } else if (hoursUntilExpiry < 1) {
                const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
                expiryText = `${minutesUntilExpiry} minutes`;
            } else if (hoursUntilExpiry < 24) {
                expiryText = hoursUntilExpiry === 1 ? '1 hour' : `${hoursUntilExpiry} hours`;
            } else {
                const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24);
                expiryText = daysUntilExpiry === 1 ? 'Tomorrow' : `${daysUntilExpiry} days`;
            }

            // Determine status for frontend
            let displayStatus = listing.status.toLowerCase();
            if (hoursUntilExpiry <= 2 && listing.status === 'AVAILABLE') {
                displayStatus = 'urgent';
            }

            return {
                id: listing.id,
                name: listing.title,
                quantity: `${listing.totalQuantity} ${listing.unit}`,
                expiry: expiryText,
                status: displayStatus,
                claims: listing.claims.length,
                location: listing.location?.name || 'Unknown Location',
                freshness: listing.freshness,
                priority: listing.priority
            };
        });
    } catch (error) {
        console.error('Error fetching provider active listings:', error);
        throw error;
    }
};

/**
 * Get provider's past/completed listings
 */
export const getProviderPastListings = async (providerId) => {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                providerId,
                status: 'COMPLETED'
            },
            include: {
                claims: {
                    where: {
                        status: 'COMPLETED'
                    },
                    include: {
                        receiver: {
                            select: {
                                name: true,
                                role: true
                            }
                        }
                    }
                },
                location: true
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 10 // Limit to last 10 completed listings
        });

        return listings.map(listing => {
            const completedClaim = listing.claims[0]; // Get the first completed claim
            const completedDate = completedClaim
                ? new Date(completedClaim.actualPickupTime || completedClaim.updatedAt)
                : new Date(listing.updatedAt);

            const daysDiff = Math.floor((new Date() - completedDate) / (1000 * 60 * 60 * 24));
            let completedText;
            if (daysDiff === 0) {
                completedText = 'Today';
            } else if (daysDiff === 1) {
                completedText = '1 day ago';
            } else if (daysDiff < 7) {
                completedText = `${daysDiff} days ago`;
            } else {
                const weeksDiff = Math.floor(daysDiff / 7);
                completedText = weeksDiff === 1 ? '1 week ago' : `${weeksDiff} weeks ago`;
            }

            // Determine category from food items
            let category = 'Other';
            if (listing.foodItems && Array.isArray(listing.foodItems)) {
                const firstItem = listing.foodItems[0];
                if (firstItem && firstItem.name) {
                    const itemName = firstItem.name.toLowerCase();
                    if (itemName.includes('bread') || itemName.includes('cake') || itemName.includes('pastry')) {
                        category = 'Bakery';
                    } else if (itemName.includes('fruit') || itemName.includes('apple') || itemName.includes('banana')) {
                        category = 'Fruits';
                    } else if (itemName.includes('vegetable') || itemName.includes('salad')) {
                        category = 'Vegetables';
                    } else if (itemName.includes('meal') || itemName.includes('rice') || itemName.includes('curry')) {
                        category = 'Prepared';
                    }
                }
            }

            return {
                id: listing.id,
                name: listing.title,
                quantity: `${listing.totalQuantity} ${listing.unit}`,
                completedDate: completedText,
                recipient: completedClaim ? completedClaim.receiver.name : 'Unknown',
                category,
                location: listing.location?.name || 'Unknown Location'
            };
        });
    } catch (error) {
        console.error('Error fetching provider past listings:', error);
        throw error;
    }
};

/**
 * Get provider business name
 */
export const getProviderBusinessName = async (providerId) => {
    try {
        if (!providerId) {
            console.error('Provider ID is undefined or null');
            return 'Provider';
        }

        const user = await prisma.user.findUnique({
            where: { id: providerId },
            include: {
                providerDetails: true
            }
        });

        return user?.providerDetails?.businessName || user?.name || 'Provider';
    } catch (error) {
        console.error('Error fetching provider business name:', error);
        return 'Provider';
    }
};

/**
 * Update listing status
 */
export const updateListingStatus = async (listingId, status, providerId) => {
    try {
        // Verify the listing belongs to the provider
        const listing = await prisma.listing.findFirst({
            where: {
                id: listingId,
                providerId
            }
        });

        if (!listing) {
            throw new Error('Listing not found or access denied');
        }

        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: { status }
        });

        return updatedListing;
    } catch (error) {
        console.error('Error updating listing status:', error);
        throw error;
    }
};

/**
 * Delete a listing
 */
export const deleteListing = async (listingId, providerId) => {
    try {
        // Verify the listing belongs to the provider and has no approved claims
        const listing = await prisma.listing.findFirst({
            where: {
                id: listingId,
                providerId
            },
            include: {
                claims: {
                    where: {
                        status: {
                            in: ['APPROVED', 'CONFIRMED', 'COMPLETED']
                        }
                    }
                }
            }
        });

        if (!listing) {
            throw new Error('Listing not found or access denied');
        }

        if (listing.claims.length > 0) {
            throw new Error('Cannot delete listing with approved claims');
        }

        // Delete the listing (this will cascade delete claims due to schema)
        await prisma.listing.delete({
            where: { id: listingId }
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
        throw error;
    }
};

/**
 * Get all claims for a provider's listings
 */
export const getProviderClaims = async (providerId, status = null) => {
    try {
        const whereClause = {
            listing: {
                providerId
            }
        };

        if (status) {
            whereClause.status = status.toUpperCase();
        }

        const claims = await prisma.claim.findMany({
            where: whereClause,
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        foodItems: true,
                        totalQuantity: true,
                        unit: true,
                        freshness: true,
                        pickupInstructions: true,
                        location: {
                            select: {
                                name: true,
                                coordinates: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return claims.map(claim => {
            const timeCreated = new Date(claim.createdAt);
            const now = new Date();
            const timeDiff = Math.floor((now - timeCreated) / (1000 * 60)); // in minutes

            let timeAgo;
            if (timeDiff < 1) {
                timeAgo = 'Just now';
            } else if (timeDiff < 60) {
                timeAgo = `${timeDiff} mins ago`;
            } else if (timeDiff < 1440) {
                const hours = Math.floor(timeDiff / 60);
                timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(timeDiff / 1440);
                timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
            }

            // Calculate urgency based on listing expiry and claim time
            const expiryTime = new Date(claim.listing.safeUntil || claim.listing.availableUntil);
            const timeUntilExpiry = expiryTime - now;
            const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

            let urgency = 'low';
            if (hoursUntilExpiry <= 2) {
                urgency = 'high';
            } else if (hoursUntilExpiry <= 6) {
                urgency = 'medium';
            }

            // Estimated arrival time (dummy calculation)
            const estimatedArrival = claim.pickupTime
                ? new Date(claim.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : 'TBD';

            return {
                id: claim.id,
                receiverName: claim.receiver.name,
                receiverEmail: claim.receiver.email,
                receiverPhone: claim.receiver.phone,
                receiverImage: claim.receiver.profile?.avatar || "/api/placeholder/40/40",
                listingId: claim.listingId,
                listingTitle: claim.listing.title,
                requestedQuantity: claim.requestedQuantity,
                approvedQuantity: claim.approvedQuantity,
                foodItems: claim.listing.foodItems || [],
                pickupCode: claim.pickupCode,
                claimTime: timeAgo,
                status: claim.status.toLowerCase(),
                urgency,
                distance: "1.2 km", // This would need location calculation
                estimatedArrival,
                pickupInstructions: claim.listing.pickupInstructions,
                location: claim.listing.location?.name || 'Unknown Location',
                notes: claim.notes,
                actualPickupTime: claim.actualPickupTime,
                createdAt: claim.createdAt,
                updatedAt: claim.updatedAt
            };
        });
    } catch (error) {
        console.error('Error fetching provider claims:', error);
        throw error;
    }
};

/**
 * Find claim by receiver email for quick verification
 */
export const findClaimByEmail = async (providerId, receiverEmail) => {
    try {
        const claim = await prisma.claim.findFirst({
            where: {
                receiver: {
                    email: receiverEmail
                },
                listing: {
                    providerId
                },
                status: {
                    in: ['PENDING', 'APPROVED', 'CONFIRMED']
                }
            },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        foodItems: true,
                        totalQuantity: true,
                        unit: true,
                        pickupInstructions: true,
                        location: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        if (!claim) {
            return null;
        }

        return {
            id: claim.id,
            receiverName: claim.receiver.name,
            receiverEmail: claim.receiver.email,
            receiverPhone: claim.receiver.phone,
            receiverImage: claim.receiver.profile?.avatar || "/api/placeholder/40/40",
            listingId: claim.listingId,
            listingTitle: claim.listing.title,
            requestedQuantity: claim.requestedQuantity,
            approvedQuantity: claim.approvedQuantity,
            foodItems: claim.listing.foodItems || [],
            pickupCode: claim.pickupCode,
            status: claim.status.toLowerCase(),
            location: claim.listing.location?.name || 'Unknown Location',
            pickupInstructions: claim.listing.pickupInstructions,
            notes: claim.notes
        };
    } catch (error) {
        console.error('Error finding claim by email:', error);
        throw error;
    }
};

/**
 * Verify pickup with OTP/code
 */
export const verifyPickupCode = async (claimId, providerId, inputCode) => {
    try {
        const claim = await prisma.claim.findFirst({
            where: {
                id: claimId,
                listing: {
                    providerId
                }
            }
        });

        if (!claim) {
            throw new Error('Claim not found or access denied');
        }

        if (claim.pickupCode !== inputCode) {
            throw new Error('Invalid pickup code');
        }

        // Update claim status to CONFIRMED
        const updatedClaim = await prisma.claim.update({
            where: { id: claimId },
            data: {
                status: 'CONFIRMED',
                pickupTime: new Date()
            }
        });

        return { success: true, claim: updatedClaim };
    } catch (error) {
        console.error('Error verifying pickup code:', error);
        throw error;
    }
};

/**
 * Complete delivery/pickup
 */
export const completeDelivery = async (claimId, providerId) => {
    try {
        const claim = await prisma.claim.findFirst({
            where: {
                id: claimId,
                listing: {
                    providerId
                }
            },
            include: {
                listing: true
            }
        });

        if (!claim) {
            throw new Error('Claim not found or access denied');
        }

        if (claim.status !== 'CONFIRMED') {
            throw new Error('Claim must be confirmed before completion');
        }

        // Update claim status to COMPLETED
        const updatedClaim = await prisma.claim.update({
            where: { id: claimId },
            data: {
                status: 'COMPLETED',
                actualPickupTime: new Date()
            }
        });

        // Check if all claims for this listing are completed
        const remainingClaims = await prisma.claim.count({
            where: {
                listingId: claim.listingId,
                status: {
                    in: ['PENDING', 'APPROVED', 'CONFIRMED']
                }
            }
        });

        // If no remaining active claims, update listing status
        if (remainingClaims === 0) {
            await prisma.listing.update({
                where: { id: claim.listingId },
                data: { status: 'COMPLETED' }
            });
        }

        return { success: true, claim: updatedClaim };
    } catch (error) {
        console.error('Error completing delivery:', error);
        throw error;
    }
};

/**
 * Update claim status (approve, reject, etc.)
 */
export const updateClaimStatus = async (claimId, providerId, status, approvedQuantity = null) => {
    try {
        const claim = await prisma.claim.findFirst({
            where: {
                id: claimId,
                listing: {
                    providerId
                }
            }
        });

        if (!claim) {
            throw new Error('Claim not found or access denied');
        }

        const updateData = { status: status.toUpperCase() };

        if (status.toUpperCase() === 'APPROVED' && approvedQuantity) {
            updateData.approvedQuantity = approvedQuantity;
            // Generate pickup code when approving
            updateData.pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
        }

        const updatedClaim = await prisma.claim.update({
            where: { id: claimId },
            data: updateData
        });

        return { success: true, claim: updatedClaim };
    } catch (error) {
        console.error('Error updating claim status:', error);
        throw error;
    }
};

/**
 * Get provider profile data
 */
export const getProviderProfile = async (providerId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: providerId },
            include: {
                profile: true,
                providerDetails: {
                    include: {
                        location: true
                    }
                },
                analytics: true
            }
        });

        if (!user) {
            throw new Error('Provider not found');
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt
            },
            profile: user.profile || {
                avatar: null,
                bio: null,
                sustainabilityScore: 0
            },
            providerDetails: user.providerDetails || {
                businessName: null,
                licenseNo: null,
                operatingHours: {},
                specialization: [],
                capacity: 0,
                location: null
            },
            analytics: user.analytics || {
                listingsCreated: 0,
                foodShared: 0,
                carbonFootprintSaved: 0,
                waterFootprintSaved: 0,
                streak: 0,
                longestStreak: 0,
                level: 1,
                points: 0,
                badges: []
            }
        };
    } catch (error) {
        console.error('Error fetching provider profile:', error);
        throw error;
    }
};

/**
 * Update provider profile
 */
export const updateProviderProfile = async (providerId, profileData) => {
    try {
        const { name, phone, bio, businessName, licenseNo, capacity } = profileData;

        const result = await prisma.$transaction(async (tx) => {
            // Update user basic info
            const updatedUser = await tx.user.update({
                where: { id: providerId },
                data: {
                    name: name || undefined,
                    phone: phone || undefined
                }
            });

            // Update or create user profile
            const updatedProfile = await tx.userProfile.upsert({
                where: { userId: providerId },
                create: {
                    userId: providerId,
                    bio: bio || null
                },
                update: {
                    bio: bio || null
                }
            });

            // Update or create provider details
            const updatedProviderDetails = await tx.providerDetails.upsert({
                where: { userId: providerId },
                create: {
                    userId: providerId,
                    businessName: businessName || null,
                    licenseNo: licenseNo || null,
                    capacity: capacity || 0
                },
                update: {
                    businessName: businessName || null,
                    licenseNo: licenseNo || null,
                    capacity: capacity || 0
                }
            });

            return {
                user: updatedUser,
                profile: updatedProfile,
                providerDetails: updatedProviderDetails
            };
        });

        return result;
    } catch (error) {
        console.error('Error updating provider profile:', error);
        throw error;
    }
};

/**
 * Update provider sustainability score
 */
export const updateSustainabilityScore = async (providerId, foodSharedKg) => {
    try {
        // Calculate points based on food shared
        const points = Math.floor(foodSharedKg * 10); // 10 points per kg

        // Calculate environmental impact
        const co2Saved = calculateCO2Reduction('prepared', foodSharedKg, 'kg');
        const waterSaved = calculateWaterSaved('prepared', foodSharedKg, 'kg');

        await prisma.$transaction(async (tx) => {
            // Get current analytics to calculate new level
            const currentAnalytics = await tx.userAnalytics.findUnique({
                where: { userId: providerId }
            });

            const newPoints = (currentAnalytics?.points || 0) + points;
            const newLevel = getLevel(newPoints);

            // Update user analytics
            await tx.userAnalytics.upsert({
                where: { userId: providerId },
                create: {
                    userId: providerId,
                    listingsCreated: 1,
                    foodShared: foodSharedKg,
                    carbonFootprintSaved: co2Saved,
                    waterFootprintSaved: waterSaved,
                    points: points,
                    level: newLevel
                },
                update: {
                    listingsCreated: { increment: 1 },
                    foodShared: { increment: foodSharedKg },
                    carbonFootprintSaved: { increment: co2Saved },
                    waterFootprintSaved: { increment: waterSaved },
                    points: { increment: points },
                    level: newLevel
                }
            });

            // Update sustainability score in profile
            const sustainabilityScore = Math.min(100, Math.floor((co2Saved + waterSaved) / 10));

            await tx.userProfile.upsert({
                where: { userId: providerId },
                create: {
                    userId: providerId,
                    sustainabilityScore: sustainabilityScore
                },
                update: {
                    sustainabilityScore: { increment: sustainabilityScore }
                }
            });
        });

        return { success: true, points, co2Saved, waterSaved };
    } catch (error) {
        console.error('Error updating sustainability score:', error);
        throw error;
    }
};

/**
 * Calculate user level based on points
 */
const getLevel = (points) => {
    if (points < 100) return 1;
    if (points < 500) return 2;
    if (points < 1000) return 3;
    if (points < 2500) return 4;
    return 5;
};