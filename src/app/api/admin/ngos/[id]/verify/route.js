import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { status } = await request.json()
        const { id } = params

        if (!["VERIFIED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const updatedNGO = await prisma.nGODetails.update({
            where: { id },
            data: {
                verificationStatus: status,
                verifiedAt: status === "VERIFIED" ? new Date() : null,
                verifiedBy: status === "VERIFIED" ? session.user.id : null
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(updatedNGO)

    } catch (error) {
        console.error("Error updating NGO verification:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
