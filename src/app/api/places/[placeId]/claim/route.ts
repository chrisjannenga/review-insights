import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { db } from '@/db'
import { claimedBusinesses } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export async function POST(
    request: Request,
    { params }: { params: { placeId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the business details from the request body
        const { name, address } = await request.json()

        if (!name || !address) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if already claimed
        const existingClaim = await db.query.claimedBusinesses.findFirst({
            where: and(
                eq(claimedBusinesses.userId, session.user.id),
                eq(claimedBusinesses.placeId, params.placeId)
            ),
        })

        if (existingClaim) {
            // If it exists, delete it (unclaim)
            await db.delete(claimedBusinesses)
                .where(and(
                    eq(claimedBusinesses.userId, session.user.id),
                    eq(claimedBusinesses.placeId, params.placeId)
                ))
            
            return NextResponse.json({ claimed: false })
        }

        // If not claimed, create new claim
        await db.insert(claimedBusinesses).values({
            userId: session.user.id,
            placeId: params.placeId,
            name,
            address,
        })

        return NextResponse.json({ claimed: true })
    } catch (error) {
        console.error('Error handling business claim:', error)
        return NextResponse.json(
            { error: 'Failed to process business claim' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { placeId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete the claim
        await db.delete(claimedBusinesses)
            .where(and(
                eq(claimedBusinesses.userId, session.user.id),
                eq(claimedBusinesses.placeId, params.placeId)
            ))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error unclaiming business:', error)
        return NextResponse.json(
            { error: 'Failed to unclaim business' },
            { status: 500 }
        )
    }
} 