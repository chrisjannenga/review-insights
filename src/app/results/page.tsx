'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import LocationSearchResults from "@/components/location-search-results";
import { ReviewLoader } from "@/components/review-loader";

interface GoogleReview {
    id: string;
    rating: number;
    text: string;
    author: string;
    date: string;
    profilePhotoUrl?: string;
    sentiment?: {
        score: number;
        label: 'positive' | 'negative' | 'neutral';
    };
}

interface PlaceDetails {
    id: string;
    name: string;
    address: string;
    rating: number;
    totalReviews: number;
    reviews: GoogleReview[];
    phoneNumber?: string;
    website?: string;
    openingHours?: {
        open_now: boolean;
        weekday_text: string[];
    };
    businessStatus?: string;
    nextPageToken?: string;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [places, setPlaces] = useState<PlaceDetails[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
    const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

    const fetchPlaceDetails = async (placeId: string, pageToken?: string) => {
        try {
            setLoadingMoreReviews(true);
            const response = await fetch(`/api/places/${placeId}/details${pageToken ? `?pageToken=${pageToken}` : ''}`);
            if (!response.ok) {
                throw new Error('Failed to fetch place details');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Error fetching place details:', err);
            return null;
        } finally {
            setLoadingMoreReviews(false);
        }
    };

    useEffect(() => {
        if (!query) {
            router.push('/');
            return;
        }

        const fetchPlaces = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch places');
                }
                const data = await response.json();
                setPlaces(data.places || []);
                if (data.places?.length > 0) {
                    setSelectedPlace(data.places[0]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [query, router]);

    const mappedLocations = places.map((place, index) => ({
        id: `${place.name}-${index}`,
        name: place.name,
        rating: place.rating,
        reviews: place.totalReviews,
        address: place.address,
        phone: place.phoneNumber,
        isOpen: place.openingHours?.open_now,
        status: place.businessStatus,
        image: "/placeholder.svg?height=200&width=300"
    }));

    const handleLocationSelect = async (locationId: string) => {
        const selected = places[Number.parseInt(locationId.split('-')[1])];
        if (selected) {
            setSelectedPlace(selected);
            const details = await fetchPlaceDetails(selected.id.toString());
            if (details) {
                const updatedPlaces = places.map(place =>
                    place.id === selected.id ? { ...place, ...details } : place
                );
                setPlaces(updatedPlaces);
                setSelectedPlace({ ...selected, ...details });
            }
        }
    };

    const handleLoadMoreReviews = async () => {
        if (selectedPlace?.nextPageToken) {
            const details = await fetchPlaceDetails(selectedPlace.id.toString(), selectedPlace.nextPageToken);
            if (details) {
                const updatedPlace = {
                    ...selectedPlace,
                    reviews: [...selectedPlace.reviews, ...details.reviews],
                    nextPageToken: details.nextPageToken
                };
                const updatedPlaces = places.map(place =>
                    place.id === selectedPlace.id ? updatedPlace : place
                );
                setPlaces(updatedPlaces);
                setSelectedPlace(updatedPlace);
            }
        }
    };

    if (loading) {
        return <ReviewLoader />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.push('/')}>Try Again</Button>
            </div>
        );
    }

    const mappedReviews = selectedPlace?.reviews.map(review => ({
        id: review.id,
        name: review.author,
        avatar: review.author[0],
        rating: review.rating,
        sentiment: review.sentiment?.label || 'neutral',
        time: review.date,
        content: review.text,
        profilePhotoUrl: review.profilePhotoUrl,
    })) || [];

    return (
        <div className="mx-auto">
            <LocationSearchResults
                initialQuery={query || ''}
                initialLocations={mappedLocations}
                initialReviews={mappedReviews}
                onLocationSelect={handleLocationSelect}
                onLoadMoreReviews={handleLoadMoreReviews}
                hasMoreReviews={!!selectedPlace?.nextPageToken}
                loadingMoreReviews={loadingMoreReviews}
            />
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<ReviewLoader />}>
            <ResultsContent />
        </Suspense>
    );
} 