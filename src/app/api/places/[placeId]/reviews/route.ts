import { NextResponse } from 'next/server'
import { db } from '@/db'
import { reviews } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } }
) {
  try {
    // Get reviews for the location
    const locationReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.placeId, params.placeId))
      .orderBy(desc(reviews.createdAt))
      .limit(50)

    // Format the reviews
    const formattedReviews = locationReviews.map((review) => ({
      id: review.id,
      name: review.authorName,
      avatar: review.authorAvatar || '',
      rating: review.rating,
      sentiment: review.sentiment,
      time: review.createdAt.toISOString(),
      content: review.content,
      profilePhotoUrl: review.authorAvatar,
      locationId: review.placeId,
    }))

    return NextResponse.json(formattedReviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
} 