import { prisma } from '@/lib/db.js';
import {
    calculateCO2Reduction,
    calculateWaterSaved,
    convertToKg,
    calculatePeopleServed
} from '@/lib/environmental-impact.js';

/**
 * Get available listings for receivers to browse
 */
export const getAvailableListings = async (filters = {}) => {
    try {
        const { search, freshness, locationId, sortBy = 'createdAt', order = 'desc' } = filters;

        const whereClause = {
            status: 'AVAILABLE',
            availableUntil: {
                gt: new Date()
            },
            safeUntil: {
                gt: new Date()
            }
        };

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (freshness && freshness !== 'all') {
            whereClause.freshness = freshness.toUpperCase();
        }

        if (locationId && locationId !== 'all' && locationId !== 'undefined' && locationId !== undefined) {
            whereClause.locationId = locationId;
        }

        // Map frontend sort options to valid database fields
        const validSortFields = {
            'createdAt': 'createdAt',
            'updatedAt': 'updatedAt',
            'title': 'title',
            'totalQuantity': 'totalQuantity',
            'safeUntil': 'safeUntil',
            'availableUntil': 'availableUntil'
        };

        const dbSortBy = validSortFields[sortBy] || 'createdAt';

        const listings = await prisma.listing.findMany({
            where: whereClause,
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
                        contactInfo: true
                    }
                },
                claims: {
                    select: {
                        id: true,
                        requestedQuantity: true,
                        approvedQuantity: true,
                        status: true
                    }
                },
                analytics: {
                    select: {
                        viewCount: true,
                        claimCount: true
                    }
                }
            },
            orderBy: {
                [dbSortBy]: order
            }
        });

        return listings.map(listing => {
            const remainingQuantity = listing.totalQuantity - listing.claimedQuantity;
            const timeRemaining = Math.ceil((new Date(listing.safeUntil) - new Date()) / (1000 * 60 * 60)); // hours

            return {
                ...listing,
                remainingQuantity,
                timeRemaining,
                provider: {
                    ...listing.provider,
                    displayName: listing.provider.providerDetails?.businessName || listing.provider.name
                }
            };
        });
    } catch (error) {
        console.error('Error fetching available listings:', error);
        throw new Error('Failed to fetch available listings');
    }
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a new claim for a listing
 */
export const createClaim = async (claimData) => {
    try {
        const { listingId, receiverId, requestedQuantity, notes } = claimData;

        // Check if listing exists and is available
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                claims: {
                    where: {
                        status: { in: ['PENDING', 'APPROVED', 'CONFIRMED'] }
                    }
                }
            }
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.status !== 'AVAILABLE') {
            throw new Error('Listing is not available for claiming');
        }

        if (new Date(listing.safeUntil) <= new Date()) {
            throw new Error('Listing has expired');
        }

        // Check if user has already claimed this listing
        const existingClaim = await prisma.claim.findFirst({
            where: {
                listingId,
                receiverId,
                status: { in: ['PENDING', 'APPROVED', 'CONFIRMED'] }
            }
        });

        if (existingClaim) {
            throw new Error('You have already claimed this listing');
        }

        // Check available quantity
        const totalClaimedQuantity = listing.claims.reduce((total, claim) => {
            return total + (claim.approvedQuantity || claim.requestedQuantity);
        }, 0);

        const remainingQuantity = listing.totalQuantity - totalClaimedQuantity;

        if (requestedQuantity > remainingQuantity) {
            throw new Error(`Only ${remainingQuantity} ${listing.unit} available`);
        }

        // Create the claim
        const claim = await prisma.claim.create({
            data: {
                listingId,
                receiverId,
                requestedQuantity,
                notes: notes || null,
                status: 'PENDING'
            },
            include: {
                listing: {
                    include: {
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
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
                                coordinates: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Update listing analytics
        await prisma.listingAnalytics.upsert({
            where: { listingId },
            update: {
                claimCount: { increment: 1 }
            },
            create: {
                listingId,
                claimCount: 1
            }
        });

        return claim;
    } catch (error) {
        console.error('Error creating claim:', error);
        throw error;
    }
};

/**
 * Get claims made by a receiver
 */
export const getReceiverClaims = async (receiverId, status = null) => {
    try {
        const whereClause = { receiverId };

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
                        description: true,
                        foodItems: true,
                        totalQuantity: true,
                        unit: true,
                        freshness: true,
                        pickupInstructions: true,
                        photos: true,
                        safeUntil: true,
                        availableUntil: true,
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

            return {
                ...claim,
                timeAgo,
                listing: {
                    ...claim.listing,
                    provider: {
                        ...claim.listing.provider,
                        displayName: claim.listing.provider.providerDetails?.businessName || claim.listing.provider.name
                    }
                }
            };
        });
    } catch (error) {
        console.error('Error fetching receiver claims:', error);
        throw new Error('Failed to fetch claims');
    }
};

/**
 * Update claim status (for receiver actions like confirming pickup)
 */
export const updateReceiverClaim = async (claimId, receiverId, updates) => {
    try {
        const { status, actualPickupTime, feedback } = updates;

        // Verify claim belongs to receiver
        const existingClaim = await prisma.claim.findFirst({
            where: {
                id: claimId,
                receiverId
            },
            include: {
                listing: true
            }
        });

        if (!existingClaim) {
            throw new Error('Claim not found or unauthorized');
        }

        // Update claim
        const updateData = {};
        if (status) {
            updateData.status = status;
            // Generate OTP when claim is confirmed
            if (status === 'CONFIRMED' && !existingClaim.pickupCode) {
                updateData.pickupCode = generateOTP();
            }
        }
        if (actualPickupTime) updateData.actualPickupTime = new Date(actualPickupTime);

        const updatedClaim = await prisma.claim.update({
            where: { id: claimId },
            data: updateData,
            include: {
                listing: {
                    include: {
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // Add feedback if provided
        if (feedback && status === 'COMPLETED') {
            await prisma.claimFeedback.create({
                data: {
                    claimId,
                    rating: feedback.rating,
                    comment: feedback.comment || null,
                    foodQuality: feedback.foodQuality || null,
                    experience: feedback.experience || null
                }
            });
        }

        // Update user analytics when claim is completed
        if (status === 'COMPLETED') {
            const quantityInKg = convertToKg(
                existingClaim.approvedQuantity || existingClaim.requestedQuantity,
                existingClaim.listing.unit
            );

            await prisma.userAnalytics.upsert({
                where: { userId: receiverId },
                update: {
                    claimsMade: { increment: 1 },
                    foodReceived: { increment: quantityInKg },
                    points: { increment: Math.floor(quantityInKg * 10) } // 10 points per kg
                },
                create: {
                    userId: receiverId,
                    claimsMade: 1,
                    foodReceived: quantityInKg,
                    points: Math.floor(quantityInKg * 10)
                }
            });

            // Update listing analytics
            await prisma.listingAnalytics.upsert({
                where: { listingId: existingClaim.listingId },
                update: {
                    peopleServed: { increment: 1 },
                    carbonSaved: { increment: calculateCO2Reduction(quantityInKg) },
                    waterSaved: { increment: calculateWaterSaved(quantityInKg) }
                },
                create: {
                    listingId: existingClaim.listingId,
                    peopleServed: 1,
                    carbonSaved: calculateCO2Reduction(quantityInKg),
                    waterSaved: calculateWaterSaved(quantityInKg)
                }
            });
        }

        return updatedClaim;
    } catch (error) {
        console.error('Error updating receiver claim:', error);
        throw error;
    }
};

/**
 * Cancel a claim
 */
export const cancelClaim = async (claimId, receiverId, cancelReason) => {
    try {
        // Verify claim belongs to receiver and can be cancelled
        const existingClaim = await prisma.claim.findFirst({
            where: {
                id: claimId,
                receiverId,
                status: { in: ['PENDING', 'APPROVED'] }
            }
        });

        if (!existingClaim) {
            throw new Error('Claim not found, unauthorized, or cannot be cancelled');
        }

        const updatedClaim = await prisma.claim.update({
            where: { id: claimId },
            data: {
                status: 'CANCELLED',
                cancelReason: cancelReason || 'Cancelled by receiver'
            },
            include: {
                listing: {
                    include: {
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return updatedClaim;
    } catch (error) {
        console.error('Error cancelling claim:', error);
        throw error;
    }
};

/**
 * Get receiver dashboard metrics
 */
export const getReceiverDashboardMetrics = async (receiverId) => {
    try {
        // Get user analytics
        const userAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId: receiverId }
        });

        // Get active claims count
        const activeClaims = await prisma.claim.count({
            where: {
                receiverId,
                status: { in: ['PENDING', 'APPROVED', 'CONFIRMED'] }
            }
        });

        // Get completed claims count
        const completedClaims = await prisma.claim.count({
            where: {
                receiverId,
                status: 'COMPLETED'
            }
        });

        // Get nearby available listings count
        const nearbyListings = await prisma.listing.count({
            where: {
                status: 'AVAILABLE',
                availableUntil: { gt: new Date() },
                safeUntil: { gt: new Date() }
            }
        });

        // Calculate average rating received from feedback
        const feedbackStats = await prisma.claimFeedback.aggregate({
            where: {
                claim: {
                    receiverId
                }
            },
            _avg: {
                rating: true
            },
            _count: {
                rating: true
            }
        });

        return {
            totalRequests: userAnalytics?.claimsMade || 0,
            activeClaims,
            completedClaims,
            mealsReceived: Math.round(userAnalytics?.foodReceived || 0),
            nearbyDonations: nearbyListings,
            rating: feedbackStats._avg.rating || 0,
            totalFeedbacks: feedbackStats._count.rating || 0,
            points: userAnalytics?.points || 0,
            level: userAnalytics?.level || 1,
            streak: userAnalytics?.streak || 0,
            carbonSaved: calculateCO2Reduction(userAnalytics?.foodReceived || 0),
            waterSaved: calculateWaterSaved(userAnalytics?.foodReceived || 0),
            moneySaved: userAnalytics?.moneySaved || 0
        };
    } catch (error) {
        console.error('Error fetching receiver dashboard metrics:', error);
        throw new Error('Failed to fetch dashboard metrics');
    }
};

/**
 * Get receiver profile
 */
export const getReceiverProfile = async (receiverId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: receiverId },
            include: {
                profile: {
                    include: {
                        campus: true
                    }
                },
                analytics: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            profile: user.profile,
            analytics: user.analytics
        };
    } catch (error) {
        console.error('Error fetching receiver profile:', error);
        throw new Error('Failed to fetch profile');
    }
};

/**
 * Update receiver profile
 */
export const updateReceiverProfile = async (receiverId, profileData) => {
    try {
        const { name, phone, bio, preferences, campusId, department, studentId, employeeId } = profileData;

        // Update user basic info
        const updateUserData = {};
        if (name) updateUserData.name = name;
        if (phone) updateUserData.phone = phone;

        if (Object.keys(updateUserData).length > 0) {
            await prisma.user.update({
                where: { id: receiverId },
                data: updateUserData
            });
        }

        // Update or create user profile
        const profileUpdateData = {};
        if (bio !== undefined) profileUpdateData.bio = bio;
        if (preferences !== undefined) profileUpdateData.preferences = preferences;
        if (campusId !== undefined) profileUpdateData.campusId = campusId;
        if (department !== undefined) profileUpdateData.department = department;
        if (studentId !== undefined) profileUpdateData.studentId = studentId;
        if (employeeId !== undefined) profileUpdateData.employeeId = employeeId;

        if (Object.keys(profileUpdateData).length > 0) {
            await prisma.userProfile.upsert({
                where: { userId: receiverId },
                update: profileUpdateData,
                create: {
                    userId: receiverId,
                    ...profileUpdateData
                }
            });
        }

        return await getReceiverProfile(receiverId);
    } catch (error) {
        console.error('Error updating receiver profile:', error);
        throw new Error('Failed to update profile');
    }
};

/**
 * Update sustainability score for receiver
 */
export const updateReceiverSustainabilityScore = async (receiverId, foodReceivedKg) => {
    try {
        const carbonSaved = calculateCO2Reduction(foodReceivedKg);
        const waterSaved = calculateWaterSaved(foodReceivedKg);
        const points = Math.floor(foodReceivedKg * 10); // 10 points per kg

        // Update sustainability score in profile
        const currentProfile = await prisma.userProfile.findUnique({
            where: { userId: receiverId }
        });

        const currentScore = currentProfile?.sustainabilityScore || 0;
        const scoreIncrease = Math.floor(carbonSaved * 100); // Score based on CO2 saved
        const newScore = Math.min(currentScore + scoreIncrease, 1000); // Cap at 1000

        await prisma.userProfile.upsert({
            where: { userId: receiverId },
            update: {
                sustainabilityScore: newScore
            },
            create: {
                userId: receiverId,
                sustainabilityScore: newScore
            }
        });

        // Update user analytics
        await prisma.userAnalytics.upsert({
            where: { userId: receiverId },
            update: {
                foodReceived: { increment: foodReceivedKg },
                carbonFootprintSaved: { increment: carbonSaved },
                waterFootprintSaved: { increment: waterSaved },
                points: { increment: points }
            },
            create: {
                userId: receiverId,
                foodReceived: foodReceivedKg,
                carbonFootprintSaved: carbonSaved,
                waterFootprintSaved: waterSaved,
                points: points
            }
        });

        return {
            sustainabilityScore: newScore,
            carbonSaved,
            waterSaved,
            points
        };
    } catch (error) {
        console.error('Error updating sustainability score:', error);
        throw new Error('Failed to update sustainability score');
    }
};

/**
 * Get recent activity for receiver
 */
export const getReceiverActivity = async (receiverId, limit = 10) => {
    try {
        const recentClaims = await prisma.claim.findMany({
            where: { receiverId },
            include: {
                listing: {
                    select: {
                        title: true,
                        totalQuantity: true,
                        unit: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return recentClaims.map(claim => ({
            type: 'claim',
            action: `${claim.status.toLowerCase()} claim`,
            description: `${claim.listing.title} - ${claim.requestedQuantity} ${claim.listing.unit}`,
            timestamp: claim.createdAt,
            status: claim.status
        }));
    } catch (error) {
        console.error('Error fetching receiver activity:', error);
        throw new Error('Failed to fetch activity');
    }
};
