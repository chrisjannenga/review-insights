import { NextResponse } from "next/server";
import { db } from "@/db";
import { businessLocations } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    // Check if business exists and is not already claimed
    const business = await db.query.businessLocations.findFirst({
      where: (locations, { eq }) => eq(locations.id, businessId),
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId) {
      return NextResponse.json(
        { error: "Business already claimed" },
        { status: 400 }
      );
    }

    // Claim the business
    await db
      .update(businessLocations)
      .set({
        userId: session.user.id,
        claimedAt: new Date(),
      })
      .where(eq(businessLocations.id, businessId));

    return NextResponse.json(
      { message: "Business claimed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error claiming business:", error);
    return NextResponse.json(
      { error: "Error claiming business" },
      { status: 500 }
    );
  }
} 