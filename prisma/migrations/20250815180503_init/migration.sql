-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('PROVIDER', 'RECEIVER', 'NGO', 'ADMIN', 'CANTEEN_MANAGER');

-- CreateEnum
CREATE TYPE "public"."NGOVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('CANTEEN', 'HOSTEL', 'EVENT_VENUE', 'OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FreshnessLevel" AS ENUM ('FRESHLY_COOKED', 'FRESH', 'GOOD', 'NEAR_EXPIRY', 'USE_IMMEDIATELY');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'PARTIALLY_CLAIMED', 'FULLY_CLAIMED', 'EXPIRED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_LISTING', 'CLAIM_UPDATE', 'PICKUP_REMINDER', 'EXPIRY_WARNING', 'SYSTEM_ANNOUNCEMENT', 'ACHIEVEMENT', 'WEEKLY_SUMMARY');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'RECEIVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "campusId" TEXT,
    "department" TEXT,
    "studentId" TEXT,
    "employeeId" TEXT,
    "preferences" JSONB,
    "sustainabilityScore" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ngo_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ngoName" TEXT NOT NULL,
    "registrationNo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "servingAreas" JSONB,
    "capacity" INTEGER,
    "verificationStatus" "public"."NGOVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "ngo_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "licenseNo" TEXT,
    "operatingHours" JSONB,
    "specialization" JSONB,
    "capacity" INTEGER,
    "locationId" TEXT,

    CONSTRAINT "provider_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "coordinates" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "settings" JSONB,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."LocationType" NOT NULL,
    "coordinates" JSONB,
    "contactInfo" JSONB,
    "operatingHours" JSONB,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "foodItems" JSONB NOT NULL,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "freshness" "public"."FreshnessLevel" NOT NULL,
    "allergens" JSONB,
    "dietaryInfo" JSONB,
    "safeUntil" TIMESTAMP(3) NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableUntil" TIMESTAMP(3) NOT NULL,
    "pickupInstructions" TEXT,
    "photos" JSONB,
    "providerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claims" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "requestedQuantity" DOUBLE PRECISION NOT NULL,
    "approvedQuantity" DOUBLE PRECISION,
    "pickupCode" TEXT,
    "pickupTime" TIMESTAMP(3),
    "actualPickupTime" TIMESTAMP(3),
    "notes" TEXT,
    "status" "public"."ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claim_feedback" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "foodQuality" INTEGER,
    "experience" INTEGER,

    CONSTRAINT "claim_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "campusId" TEXT NOT NULL,
    "locationId" TEXT,
    "organizerEmail" TEXT NOT NULL,
    "expectedAttendees" INTEGER,
    "foodOrdered" JSONB,
    "autoPromptEnabled" BOOLEAN NOT NULL DEFAULT true,
    "promptSentAt" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "channel" "public"."NotificationChannel" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "actionTaken" TEXT,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enableEmail" BOOLEAN NOT NULL DEFAULT true,
    "enablePush" BOOLEAN NOT NULL DEFAULT true,
    "enableSMS" BOOLEAN NOT NULL DEFAULT false,
    "newListings" BOOLEAN NOT NULL DEFAULT true,
    "claimUpdates" BOOLEAN NOT NULL DEFAULT true,
    "pickupReminders" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "achievements" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listing_analytics" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "claimCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "carbonSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "peopleServed" INTEGER NOT NULL DEFAULT 0,
    "timeToFirstClaim" INTEGER,
    "timeToFullClaim" INTEGER,

    CONSTRAINT "listing_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingsCreated" INTEGER NOT NULL DEFAULT 0,
    "foodShared" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbonFootprintSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterFootprintSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "claimsMade" INTEGER NOT NULL DEFAULT 0,
    "foodReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moneySaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "badges" JSONB,
    "level" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "maxListings" INTEGER,
    "maxClaims" INTEGER,
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "customization" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "public"."user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_details_userId_key" ON "public"."ngo_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_details_userId_key" ON "public"."provider_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "claim_feedback_claimId_key" ON "public"."claim_feedback"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "public"."notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_analytics_listingId_key" ON "public"."listing_analytics"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "user_analytics_userId_key" ON "public"."user_analytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "public"."subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "public"."campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ngo_details" ADD CONSTRAINT "ngo_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provider_details" ADD CONSTRAINT "provider_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provider_details" ADD CONSTRAINT "provider_details_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "public"."campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claims" ADD CONSTRAINT "claims_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claims" ADD CONSTRAINT "claims_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claim_feedback" ADD CONSTRAINT "claim_feedback_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "public"."campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listing_analytics" ADD CONSTRAINT "listing_analytics_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_analytics" ADD CONSTRAINT "user_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
