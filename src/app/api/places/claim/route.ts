import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/db";
import { claimedBusinesses, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log('Session user:', {
        id: session.user.id,
        email: session.user.email,
    });

    try {
        // First verify the user exists
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        console.log('User exists check:', {
            userId: session.user.id,
            exists: !!userExists,
            userDetails: userExists,
        });

        if (!userExists) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        const { placeId, name, address } = await request.json();

        if (!placeId || !name || !address) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        console.log('Attempting to claim/unclaim:', {
            placeId,
            name,
            address,
            userId: session.user.id
        });

        // Check if the business is already claimed by this user
        const existingClaim = await db.query.claimedBusinesses.findFirst({
            where: and(
                eq(claimedBusinesses.userId, session.user.id),
                eq(claimedBusinesses.placeId, placeId)
            ),
        });

        console.log('Existing claim check:', {
            exists: !!existingClaim,
            claim: existingClaim
        });

        if (existingClaim) {
            // If it exists, delete it (unclaim)
            await db.delete(claimedBusinesses)
                .where(and(
                    eq(claimedBusinesses.userId, session.user.id),
                    eq(claimedBusinesses.placeId, placeId)
                ));
            
            return NextResponse.json({ claimed: false });
        }

        // If it doesn't exist, create it (claim)
        await db.insert(claimedBusinesses).values({
            userId: session.user.id,
            placeId,
            name,
            address,
        });

        return NextResponse.json({ claimed: true });
    } catch (error) {
        console.error("Error handling business claim:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log('GET - Session user:', {
        id: session.user.id,
        email: session.user.email,
    });

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
        return new NextResponse("Missing placeId", { status: 400 });
    }

    try {
        const claim = await db.query.claimedBusinesses.findFirst({
            where: and(
                eq(claimedBusinesses.userId, session.user.id),
                eq(claimedBusinesses.placeId, placeId)
            ),
        });

        console.log('GET - Claim check:', {
            placeId,
            userId: session.user.id,
            exists: !!claim
        });

        return NextResponse.json({ claimed: !!claim });
    } catch (error) {
        console.error("Error checking business claim:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 