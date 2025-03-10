"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { LocationDetail } from "@/components/location-detail"

interface APIReview {
    id: string;
    author: string;
    rating: number;
    text: string;
    time: string;
    sentiment: "positive" | "neutral" | "negative";
}

interface LocationDetails {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    address: string;
    phone: string;
    status: string;
    isOpen: boolean;
    photoUrl: string;
    ratingBreakdown: Array<{ stars: number; percentage: number }>;
    sentiment: {
        positive: number;
        neutral: number;
        negative: number;
        analysis: string;
    };
    reviews: Array<{
        id: string;
        author: string;
        date: string;
        rating: number;
        content: string;
        sentiment: "positive" | "neutral" | "negative";
    }>;
}

export default function LocationPage() {
    const params = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [locationData, setLocationData] = useState<LocationDetails | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    useEffect(() => {
        const fetchLocationData = async () => {
            try {
                // Cancel any previous in-flight requests
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort()
                }
                // Create new abort controller for this request cycle
                abortControllerRef.current = new AbortController()

                setIsLoading(true)
                setError(null)

                // Fetch all data in parallel for better performance
                const [claimedResponse, placesResponse] = await Promise.all([
                    fetch(`/api/places/${params.placeId}`),
                    fetch(`/api/places/${params.placeId}/details`)
                ]);

                if (!claimedResponse.ok) {
                    throw new Error('Failed to fetch claimed business')
                }
                if (!placesResponse.ok) {
                    throw new Error('Failed to fetch place details')
                }

                const [claimedData, placesData] = await Promise.all([
                    claimedResponse.json(),
                    placesResponse.json()
                ]);

                // Calculate rating breakdown
                const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
                    const count = placesData.reviews.filter((r: { rating: number }) => r.rating === stars).length
                    const percentage = Math.round((count / placesData.reviews.length) * 100) || 0
                    return { stars, percentage }
                })

                // Prepare the combined data
                const combinedData: LocationDetails = {
                    id: params.placeId.toString(),
                    name: placesData.name || claimedData.name,
                    rating: placesData.rating || 0,
                    reviewCount: placesData.user_ratings_total || placesData.reviews.length,
                    address: placesData.formatted_address || claimedData.address,
                    phone: placesData.formatted_phone_number || '',
                    status: placesData.business_status || 'OPERATIONAL',
                    isOpen: placesData.opening_hours?.open_now || false,
                    photoUrl: placesData.photo_url || '',
                    ratingBreakdown,
                    sentiment: placesData.sentiment || {
                        positive: 0,
                        neutral: 0,
                        negative: 0,
                        analysis: ''
                    },
                    reviews: placesData.reviews.map((review: APIReview) => ({
                        id: review.id,
                        author: review.author || 'Anonymous',
                        date: review.time || 'Recent',
                        rating: review.rating,
                        content: review.text || '',
                        sentiment: review.sentiment
                    }))
                }

                // Get sentiment analysis only if we have reviews
                if (combinedData.reviews.length > 0) {
                    const reviewsForAnalysis = combinedData.reviews.map(review => ({
                        text: review.content,
                        rating: review.rating
                    }));

                    const analysisResponse = await fetch('/api/analyze-sentiment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            reviews: reviewsForAnalysis,
                            type: 'summary',
                            locationName: combinedData.name
                        }),
                        signal: abortControllerRef.current.signal
                    });

                    if (analysisResponse.ok) {
                        const analysisData = await analysisResponse.json();
                        combinedData.sentiment.analysis = analysisData.analysis;
                    }
                }

                // Single state update with all data
                setLocationData(combinedData);

            } catch (err) {
                // Only set error if it's not an abort error
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error fetching location data:', err)
                    setError(err instanceof Error ? err.message : 'Failed to load location data')
                }
            } finally {
                setIsLoading(false)
            }
        }

        if (params.placeId) {
            fetchLocationData()
        }

        // Cleanup function to handle component unmounting
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            setLocationData(null)
            setIsLoading(true)
            setError(null)
        }
    }, [params.placeId])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
            </div>
        )
    }

    if (error || !locationData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">
                        {error || 'Location not found'}
                    </h1>
                </div>
            </div>
        )
    }

    return <LocationDetail location={locationData} />
} 