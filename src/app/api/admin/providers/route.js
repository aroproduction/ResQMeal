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

        const providers = await prisma.user.findMany({
            where: {
                OR: [
                    { role: "PROVIDER" },
                    { role: "CANTEEN_MANAGER" }
                ]
            },
            include: {
                providerDetails: {
                    include: {
                        location: true
                    }
                },
                _count: {
                    select: {
                        listings: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(providers)

    } catch (error) {
        console.error("Error fetching providers:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
