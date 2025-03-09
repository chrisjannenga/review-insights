import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/db";
import { claimedBusinesses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log('GET claimed - Session user:', {
        id: session.user.id,
        email: session.user.email,
    });

    try {
        const claims = await db.query.claimedBusinesses.findMany({
            where: eq(claimedBusinesses.userId, session.user.id),
        });

        console.log('Claimed businesses found:', claims.length);

        return NextResponse.json(claims);
    } catch (error) {
        console.error("Error fetching claimed businesses:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 