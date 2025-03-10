import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { claimedBusinesses } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const formData = await request.formData();
        const placeId = formData.get("placeId") as string;
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;

        if (!placeId || !name || !address) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if business is already claimed
        const existingClaim = await db.query.claimedBusinesses.findFirst({
            where: (businesses, { eq }) => eq(businesses.placeId, placeId),
        });

        if (existingClaim) {
            return new NextResponse("Business already claimed", { status: 400 });
        }

        // Create new business claim
        await db.insert(claimedBusinesses).values({
            userId: session.user.id,
            placeId,
            name,
            address,
        });

        return new NextResponse("Business claimed successfully", { status: 200 });
    } catch (error) {
        console.error("Error claiming business:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 