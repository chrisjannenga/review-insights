import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from '@/db'
import { claimedBusinesses } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    // Get location details from your database
    const [location] = await db
      .select()
      .from(claimedBusinesses)
      .where(eq(claimedBusinesses.placeId, params.placeId))
      .limit(1)

    if (!location) {
      return new NextResponse(JSON.stringify({ error: 'Location not found' }), {
        status: 404,
      })
    }

    // Format the response
    const formattedLocation = {
      id: location.id,
      name: location.name,
      placeId: location.placeId,
      address: location.address,
      createdAt: location.createdAt,
    }

    return NextResponse.json(formattedLocation)
  } catch (error) {
    console.error('Error fetching location:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
} 