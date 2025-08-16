import { NextResponse } from "next/server";
import { PrismaClient, UserRole, NGOVerificationStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, phone, role, isNGO, ngoData, providerData } = await req.json();

    // Check if already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Validate role
    const validRoles = ["PROVIDER", "RECEIVER", "NGO", "ADMIN", "CANTEEN_MANAGER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: isNGO ? UserRole.RECEIVER : role, // NGOs are receivers in the system
        },
      });

      // Create profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          bio: "",
        },
      });

      // Role-specific inserts
      if (role === UserRole.RECEIVER && isNGO && ngoData) {
        await tx.nGODetails.create({
          data: {
            userId: user.id,
            ngoName: ngoData.ngoName,
            registrationNo: ngoData.registrationNo,
            website: ngoData.website || "",
            description: ngoData.description || "",
            servingAreas: ngoData.servingAreas ? JSON.parse(JSON.stringify(ngoData.servingAreas)) : null,
            capacity: ngoData.capacity ? parseInt(ngoData.capacity) : null,
            verificationStatus: NGOVerificationStatus.PENDING,
          },
        });
      }

      if (role === UserRole.PROVIDER && providerData) {
        await tx.providerDetails.create({
          data: {
            userId: user.id,
            businessName: providerData.businessName || "",
            licenseNo: providerData.licenseNo || "",
            operatingHours: providerData.operatingHours ? JSON.parse(JSON.stringify(providerData.operatingHours)) : null,
            specialization: providerData.specialization ? JSON.parse(JSON.stringify(providerData.specialization)) : null,
            capacity: providerData.capacity ? parseInt(providerData.capacity) : null,
          },
        });
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      userId: result.id,
      message: "Account created successfully"
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
