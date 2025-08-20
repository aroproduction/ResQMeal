import { prisma } from '@/lib/db.js';

/**
 * Database service for TTL (Time To Live) management
 * Handles automatic expiration of listings based on safeUntil timestamp
 */

/**
 * Check and update expired listings
 * This function should be called before any listing query to ensure data consistency
 */
export const checkAndUpdateExpiredListings = async () => {
    try {
        const now = new Date();

        // Find all listings that have expired (safeUntil < now) and are still active
        const expiredListings = await prisma.listing.findMany({
            where: {
                safeUntil: {
                    lt: now
                },
                status: {
                    in: ['AVAILABLE', 'PARTIALLY_CLAIMED']
                }
            },
            include: {
                claims: {
                    where: {
                        status: {
                            in: ['APPROVED', 'COMPLETED']
                        }
                    }
                }
            }
        });

        if (expiredListings.length === 0) {
            return { updatedCount: 0, results: [] };
        }

        const updateResults = [];

        // Process each expired listing
        for (const listing of expiredListings) {
            try {
                // Calculate claimed quantity
                const claimedQuantity = listing.claims.reduce((sum, claim) => {
                    return sum + (claim.approvedQuantity || claim.requestedQuantity || 0);
                }, 0);

                // Calculate wasted quantity
                const wastedQuantity = Math.max(0, listing.totalQuantity - claimedQuantity);

                // Update the listing to EXPIRED status
                await prisma.listing.update({
                    where: { id: listing.id },
                    data: {
                        status: 'EXPIRED',
                        updatedAt: now
                    }
                });

                updateResults.push({
                    listingId: listing.id,
                    title: listing.title,
                    totalQuantity: listing.totalQuantity,
                    claimedQuantity,
                    wastedQuantity,
                    status: 'expired'
                });

            } catch (error) {
                console.error(`Error updating expired listing ${listing.id}:`, error);
                updateResults.push({
                    listingId: listing.id,
                    title: listing.title,
                    status: 'error',
                    error: error.message
                });
            }
        }

        console.log(`Updated ${expiredListings.length} expired listings`);
        return { updatedCount: expiredListings.length, results: updateResults };

    } catch (error) {
        console.error('Error in checkAndUpdateExpiredListings:', error);
        throw error;
    }
};

/**
 * Update claimed quantity when a claim is approved
 */
export const updateListingClaimedQuantity = async (listingId) => {
    try {
        // Get all approved claims for this listing
        const approvedClaims = await prisma.claim.findMany({
            where: {
                listingId,
                status: {
                    in: ['APPROVED', 'COMPLETED']
                }
            }
        });

        // Calculate total claimed quantity
        const totalClaimed = approvedClaims.reduce((sum, claim) => {
            return sum + (claim.approvedQuantity || claim.requestedQuantity || 0);
        }, 0);

        // Get the listing to check total quantity
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { totalQuantity: true, status: true }
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        // Determine new status based on claimed quantity
        let newStatus = listing.status;
        if (totalClaimed >= listing.totalQuantity) {
            newStatus = 'FULLY_CLAIMED';
        } else if (totalClaimed > 0) {
            newStatus = 'PARTIALLY_CLAIMED';
        }

        // Update the listing
        await prisma.listing.update({
            where: { id: listingId },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        });

        return { claimedQuantity: totalClaimed, status: newStatus };

    } catch (error) {
        console.error('Error updating listing claimed quantity:', error);
        throw error;
    }
};

/**
 * Get listings with TTL information
 * Automatically checks for expired listings before returning results
 */
export const getListingsWithTTL = async (filters = {}) => {
    try {
        // First, update any expired listings
        await checkAndUpdateExpiredListings();

        // Build where clause
        const whereClause = {};

        if (filters.providerId) {
            whereClause.providerId = filters.providerId;
        }

        if (filters.status) {
            if (filters.status.includes(',')) {
                // Handle multiple statuses
                whereClause.status = {
                    in: filters.status.split(',').map(s => s.trim().toUpperCase())
                };
            } else {
                whereClause.status = filters.status.toUpperCase();
            }
        }

        if (filters.excludeExpired) {
            whereClause.status = {
                notIn: ['EXPIRED']
            };
        }

        // Get listings
        const listings = await prisma.listing.findMany({
            where: whereClause,
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                location: true,
                claims: {
                    include: {
                        receiver: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        claims: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },     // Non-expired first
                { priority: 'desc' },  // Then by priority
                { safeUntil: 'asc' }   // Then by expiry time
            ]
        });

        // Add computed fields for better UI display
        const enrichedListings = listings.map(listing => {
            const now = new Date();
            const timeUntilExpiry = listing.safeUntil.getTime() - now.getTime();
            const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
            const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));

            // Calculate claimed quantity from approved claims
            const claimedQuantity = listing.claims
                .filter(claim => ['APPROVED', 'COMPLETED'].includes(claim.status))
                .reduce((sum, claim) => sum + (claim.approvedQuantity || claim.requestedQuantity || 0), 0);

            const isExpired = listing.status === 'EXPIRED' || timeUntilExpiry <= 0;
            const wastedQuantity = isExpired ? Math.max(0, listing.totalQuantity - claimedQuantity) : 0;

            return {
                ...listing,
                timeUntilExpiry: timeUntilExpiry > 0 ? `${hoursUntilExpiry}h ${minutesUntilExpiry}m` : 'Expired',
                completionRate: listing.totalQuantity > 0 ? (claimedQuantity / listing.totalQuantity) * 100 : 0,
                remainingQuantity: Math.max(0, listing.totalQuantity - claimedQuantity),
                claimedQuantity,
                wastedQuantity,
                isExpired
            };
        });

        return enrichedListings;

    } catch (error) {
        console.error('Error in getListingsWithTTL:', error);
        throw error;
    }
};

/**
 * Get TTL statistics for dashboard
 */
export const getTTLStats = async (providerId = null) => {
    try {
        // Update expired listings first
        await checkAndUpdateExpiredListings();

        const whereClause = providerId ? { providerId } : {};

        const [
            totalListings,
            activeListings,
            expiredListings,
            todayExpired
        ] = await Promise.all([
            prisma.listing.count({ where: whereClause }),
            prisma.listing.count({
                where: {
                    ...whereClause,
                    status: { in: ['AVAILABLE', 'PARTIALLY_CLAIMED'] }
                }
            }),
            prisma.listing.count({
                where: { ...whereClause, status: 'EXPIRED' }
            }),
            prisma.listing.count({
                where: {
                    ...whereClause,
                    status: 'EXPIRED',
                    updatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        // Calculate total claimed and wasted quantities
        const allListings = await prisma.listing.findMany({
            where: whereClause,
            include: {
                claims: {
                    where: {
                        status: {
                            in: ['APPROVED', 'COMPLETED']
                        }
                    }
                }
            }
        });

        let totalClaimed = 0;
        let totalWasted = 0;

        allListings.forEach(listing => {
            const claimedQuantity = listing.claims.reduce((sum, claim) => {
                return sum + (claim.approvedQuantity || claim.requestedQuantity || 0);
            }, 0);

            totalClaimed += claimedQuantity;

            if (listing.status === 'EXPIRED') {
                totalWasted += Math.max(0, listing.totalQuantity - claimedQuantity);
            }
        });

        return {
            totalListings,
            activeListings,
            expiredListings,
            todayExpired,
            totalWasted,
            totalClaimed,
            wasteRate: totalListings > 0 ? (expiredListings / totalListings) * 100 : 0
        };

    } catch (error) {
        console.error('Error in getTTLStats:', error);
        throw error;
    }
};
