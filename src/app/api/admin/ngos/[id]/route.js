import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js"

const prisma = new PrismaClient()

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params

        const ngoDetails = await prisma.nGODetails.findUnique({
            where: { id },
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
            }
        })

        if (!ngoDetails) {
            return NextResponse.json({ error: "NGO not found" }, { status: 404 })
        }

        return NextResponse.json(ngoDetails)

    } catch (error) {
        console.error("Error fetching NGO details:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
