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

        const ngos = await prisma.nGODetails.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        createdAt: true
                    }
                }
            },
            orderBy: [
                { verificationStatus: 'asc' }, // PENDING first
                { user: { createdAt: 'desc' } }
            ]
        })

        return NextResponse.json(ngos)

    } catch (error) {
        console.error("Error fetching NGOs:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
