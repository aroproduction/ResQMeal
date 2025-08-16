import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js"

const prisma = new PrismaClient()

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user statistics
        const [
            totalUsers,
            pendingNGOs,
            verifiedNGOs,
            providers,
            receivers,
            ngoUsers
        ] = await Promise.all([
            prisma.user.count(),
            prisma.nGODetails.count({
                where: { verificationStatus: "PENDING" }
            }),
            prisma.nGODetails.count({
                where: { verificationStatus: "VERIFIED" }
            }),
            prisma.user.count({
                where: { role: "PROVIDER" }
            }),
            prisma.user.count({
                where: { role: "RECEIVER" }
            }),
            prisma.user.count({
                where: { role: "NGO" }
            })
        ])

        const individualReceivers = receivers - ngoUsers

        return NextResponse.json({
            totalUsers,
            pendingNGOs,
            verifiedNGOs,
            providers,
            receivers,
            individualReceivers,
            ngoUsers
        })

    } catch (error) {
        console.error("Error fetching admin stats:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
