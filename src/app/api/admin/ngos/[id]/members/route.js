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

        // First get the NGO details to get the NGO name
        const ngoDetails = await prisma.nGODetails.findUnique({
            where: { id },
            select: { ngoName: true }
        })

        if (!ngoDetails) {
            return NextResponse.json({ error: "NGO not found" }, { status: 404 })
        }

        // Find all users with role NGO that might be associated with this NGO
        // This is a simplified approach - in a real system, you might want to have a more explicit relationship
        const members = await prisma.user.findMany({
            where: {
                role: "NGO",
                // You could add additional logic here to match users to specific NGOs
                // For now, we'll return all NGO users, but you could filter by NGO name in user profile or other criteria
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(members)

    } catch (error) {
        console.error("Error fetching NGO members:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
