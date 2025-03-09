import { NextResponse } from 'next/server';

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

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        console.error('Google Places API key is not configured');
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    try {
        // Use Places API v1 for place details
        const detailsUrl = `https://places.googleapis.com/v1/places/${params.id}`;

        const response = await fetch(detailsUrl, {
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,internationalPhoneNumber,websiteUri,regularOpeningHours,businessStatus,reviews'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Places API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch place details', details: errorData },
                { status: response.status }
            );
        }

        const placeData: PlaceDetails = await response.json();
        
        // Transform the place data to match our application's format
        const transformedPlace = {
            id: placeData.id,
            placeId: placeData.id,
            name: placeData.displayName?.text || '',
            address: placeData.formattedAddress || '',
            rating: placeData.rating || 0,
            totalReviews: placeData.userRatingCount || 0,
            phoneNumber: placeData.internationalPhoneNumber || '',
            website: placeData.websiteUri || '',
            openingHours: placeData.regularOpeningHours ? {
                open_now: Boolean(placeData.regularOpeningHours.periods?.some((period: Period) => period.open)),
                weekday_text: placeData.regularOpeningHours.weekdayDescriptions || [],
            } : undefined,
            businessStatus: placeData.businessStatus || '',
            reviews: (placeData.reviews || []).map((review) => ({
                id: review.name,
                rating: review.rating || 0,
                text: typeof review.text === 'string' ? review.text : 
                    (review.text && typeof review.text === 'object' && 'text' in review.text) ? review.text.text : '',
                author: review.authorAttribution?.displayName || '',
                date: review.relativePublishTimeDescription || '',
                profilePhotoUrl: review.authorAttribution?.photoUri || '',
            }))
        };

        return NextResponse.json(transformedPlace);
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