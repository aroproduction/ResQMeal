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

        const receivers = await prisma.user.findMany({
            where: {
                OR: [
                    { role: "RECEIVER" },
                    { role: "NGO" }
                ]
            },
            include: {
                profile: true,
                _count: {
                    select: {
                        claims: true
                    }
                }
            },
            orderBy: [
                { role: 'asc' }, // NGOs first, then individual receivers
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json(receivers)

    } catch (error) {
        console.error("Error fetching receivers:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
