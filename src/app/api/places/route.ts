import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeSentiment(text: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with ONLY a JSON object in this exact format: {\"score\": number, \"label\": string} where score is between -1 and 1, and label is one of: \"positive\", \"negative\", or \"neutral\"."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0
        });

        const result = response.choices[0].message.content;
        if (!result) return null;

        try {
            // Parse the JSON response
            const sentiment = JSON.parse(result);
            if (typeof sentiment.score !== 'number' || !['positive', 'negative', 'neutral'].includes(sentiment.label)) {
                console.error('Invalid sentiment response format:', sentiment);
                return null;
            }
            return {
                score: sentiment.score,
                label: sentiment.label,
            };
        } catch (parseError) {
            console.error('Error parsing sentiment JSON:', parseError);
            return null;
        }
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return null;
    }
}

interface Review {
    name: string;
    text: string | { text: string };
    rating: number;
    relativePublishTimeDescription: string;
    authorAttribution: {
        displayName: string;
        photoUri?: string;
    };
}

interface SearchResult {
    places: Array<{
        id: string;
        displayName: { text: string };
        formattedAddress: string;
        rating?: number;
        userRatingCount?: number;
        internationalPhoneNumber?: string;
        websiteUri?: string;
        regularOpeningHours?: {
            periods: Array<{ open?: boolean }>;
            weekdayDescriptions: string[];
        };
        businessStatus?: string;
        reviews?: Review[];
    }>;
    pageToken?: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const pageToken = searchParams.get('pageToken');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!query && !pageToken) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!apiKey) {
        console.error('Google Places API key is not configured');
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    try {
        // Use Places API v1 for search
        const searchUrl = pageToken
            ? `https://places.googleapis.com/v1/places:searchText?pageToken=${encodeURIComponent(pageToken)}`
            : 'https://places.googleapis.com/v1/places:searchText';

        const searchResponse = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.businessStatus,places.reviews.name,places.reviews.text,places.reviews.rating,places.reviews.relativePublishTimeDescription,places.reviews.authorAttribution'
            },
            body: JSON.stringify({
                textQuery: query || '',
                languageCode: "en",
                maxResultCount: 20,
                ...(pageToken ? { pageToken } : {})
            })
        });

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            console.error('Places API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch places', details: errorData },
                { status: searchResponse.status }
            );
        }

        const searchData: SearchResult = await searchResponse.json();
        if (!searchData.places?.length) {
            return NextResponse.json({ error: 'No places found' }, { status: 404 });
        }

        // Transform the places data directly from the search response
        const transformedPlaces = await Promise.all(searchData.places.map(async (place) => {
            // Analyze sentiment for each review if reviews exist
            const reviewsWithSentiment = await Promise.all(
                (place.reviews || []).map(async (review: Review) => {
                    const reviewText = typeof review.text === 'string' ? review.text : 
                        (review.text && typeof review.text === 'object' && 'text' in review.text) ? review.text.text : '';
                    const sentiment = await analyzeSentiment(reviewText);
                    return {
                        id: review.name,
                        rating: review.rating || 0,
                        text: reviewText,
                        author: review.authorAttribution?.displayName || '',
                        date: review.relativePublishTimeDescription || '',
                        profilePhotoUrl: review.authorAttribution?.photoUri || '',
                        sentiment,
                    };
                })
            );

            return {
                name: place.displayName?.text || '',
                address: place.formattedAddress || '',
                rating: place.rating || 0,
                totalReviews: place.userRatingCount || 0,
                phoneNumber: place.internationalPhoneNumber || '',
                website: place.websiteUri || '',
                openingHours: place.regularOpeningHours ? {
                    open_now: Boolean(place.regularOpeningHours.periods?.some(period => period.open)),
                    weekday_text: place.regularOpeningHours.weekdayDescriptions || [],
                } : undefined,
                businessStatus: place.businessStatus || '',
                reviews: reviewsWithSentiment,
                id: place.id || '',
                placeId: place.id || '',
            };
        }));

        return NextResponse.json({
            places: transformedPlaces,
            nextPageToken: searchData.pageToken
        });
    } catch (error: unknown) {
        console.error('Error fetching place details:', error);
        if (error instanceof Error) {
            console.error('Error response:', error.message);
        }
        return NextResponse.json(
            { 
                error: 'Failed to fetch place details',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 