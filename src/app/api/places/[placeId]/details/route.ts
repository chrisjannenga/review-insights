import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

interface Period {
    open: boolean;
    openDay?: number;
    openTime?: string;
    closeDay?: number;
    closeTime?: string;
}

interface PlaceDetails {
    id: string;
    displayName?: {
        text: string;
    };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    regularOpeningHours?: {
        periods?: Period[];
        weekdayDescriptions?: string[];
    };
    businessStatus?: string;
    reviews?: Array<{
        name: string;
        rating?: number;
        text: string | { text: string };
        authorAttribution?: {
            displayName?: string;
            photoUri?: string;
        };
        relativePublishTimeDescription?: string;
    }>;
}

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

export async function GET(
    request: Request,
    { params }: { params: { placeId: string } }
) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        console.error('Google Places API key is not configured');
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    try {
        const placeUrl = `https://places.googleapis.com/v1/places/${params.placeId}`;
        const placeResponse = await fetch(placeUrl, {
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,internationalPhoneNumber,websiteUri,regularOpeningHours,businessStatus,reviews.name,reviews.text,reviews.rating,reviews.relativePublishTimeDescription,reviews.authorAttribution,photos.name'
            }
        });

        if (!placeResponse.ok) {
            const errorData = await placeResponse.json();
            console.error('Places API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch place details', details: errorData },
                { status: placeResponse.status }
            );
        }

        const placeData = await placeResponse.json();

        // If there's a photo, get the first one's URL
        let photoUrl = null;
        if (placeData.photos && placeData.photos.length > 0) {
            const photoName = placeData.photos[0].name;
            const photoResponse = await fetch(
                `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&skipHttpRedirect=true`,
                {
                    headers: {
                        'X-Goog-Api-Key': apiKey,
                    }
                }
            );

            if (photoResponse.ok) {
                const photoData = await photoResponse.json();
                photoUrl = photoData.photoUri;
            }
        }

        // Process reviews with sentiment analysis
        const reviewsWithSentiment = await Promise.all(
            (placeData.reviews || []).map(async (review: any) => {
                const reviewText = typeof review.text === 'string' ? review.text : 
                    (review.text && typeof review.text === 'object' && 'text' in review.text) ? review.text.text : '';
                const sentiment = await analyzeSentiment(reviewText);
                
                return {
                    id: review.name,
                    author: review.authorAttribution?.displayName || 'Anonymous',
                    rating: review.rating || 0,
                    text: reviewText,
                    time: review.relativePublishTimeDescription || 'Recent',
                    sentiment: sentiment?.label || 'neutral'
                };
            })
        );

        // Calculate overall sentiment statistics
        const sentimentCounts = reviewsWithSentiment.reduce((acc: any, review) => {
            acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
            return acc;
        }, {});

        const total = reviewsWithSentiment.length;
        const sentimentPercentages = {
            positive: Math.round((sentimentCounts.positive || 0) / total * 100) || 0,
            neutral: Math.round((sentimentCounts.neutral || 0) / total * 100) || 0,
            negative: Math.round((sentimentCounts.negative || 0) / total * 100) || 0
        };

        // Transform the place data
        const transformedData = {
            id: placeData.id,
            name: placeData.displayName?.text || '',
            rating: placeData.rating || 0,
            user_ratings_total: placeData.userRatingCount || 0,
            formatted_address: placeData.formattedAddress || '',
            formatted_phone_number: placeData.internationalPhoneNumber || '',
            business_status: placeData.businessStatus || 'OPERATIONAL',
            photo_url: photoUrl,
            opening_hours: {
                open_now: placeData.regularOpeningHours?.periods?.some((period: any) => period.open) || false,
                weekday_text: placeData.regularOpeningHours?.weekdayDescriptions || []
            },
            reviews: reviewsWithSentiment,
            sentiment: {
                ...sentimentPercentages,
                analysis: 'Sentiment analysis based on review content.'
            }
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error('Error fetching place details:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch place details',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 