'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { LocationOverview } from '@/components/location-overview';
import { RatingBreakdown } from '@/components/rating-breakdown';
import { SentimentAnalysis } from '@/components/sentiment-analysis';
import { ReviewList } from '@/components/review-list';
import { Card } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import type { RatingItem } from '@/components/rating-breakdown';
import type { ReviewItemProps } from '@/components/review-item';

interface BusinessDetails {
    name: string;
    rating: number;
    reviewCount: number;
    address: string;
    phone: string;
    status: string;
    isOpen: boolean;
}

interface Review {
    id: string;
    name: string;
    rating: number;
    content: string;
    time: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    avatar: string;
}

export default function BusinessPage({ params }: { params: { placeId: string } }) {
    const { data: session } = useSession();
    const [business, setBusiness] = useState<BusinessDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sentimentStats, setSentimentStats] = useState({
        positive: 0,
        neutral: 0,
        negative: 0,
        analysis: ''
    });

    const calculateRatingBreakdown = (reviews: Review[]): RatingItem[] => {
        const totalReviews = reviews.length;
        const ratingCounts = reviews.reduce((acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        return [5, 4, 3, 2, 1].map(stars => ({
            stars,
            percentage: Math.round((ratingCounts[stars] || 0) / totalReviews * 100)
        }));
    };

    const calculateSentimentStats = useCallback((reviews: Review[]) => {
        const totalReviews = reviews.length;
        const sentimentCounts = reviews.reduce((acc, review) => {
            acc[review.sentiment]++;
            return acc;
        }, { positive: 0, neutral: 0, negative: 0 });

        return {
            positive: Math.round(sentimentCounts.positive / totalReviews * 100),
            neutral: Math.round(sentimentCounts.neutral / totalReviews * 100),
            negative: Math.round(sentimentCounts.negative / totalReviews * 100),
            analysis: 'Overall sentiment analysis of customer reviews.'
        };
    }, []);

    const transformToReviewItems = (reviews: Review[]): ReviewItemProps[] => {
        return reviews.map(review => ({
            id: review.id,
            author: review.name,
            date: review.time,
            rating: review.rating,
            content: review.content,
            sentiment: review.sentiment
        }));
    };

    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                // Here you would fetch the business details from your API
                // For now, we'll use mock data
                const mockBusiness = {
                    name: "Sample Business",
                    rating: 4.5,
                    reviewCount: 128,
                    address: "123 Main St, City, State",
                    phone: "(555) 123-4567",
                    status: "Claimed",
                    isOpen: true
                };
                setBusiness(mockBusiness);

                // Mock reviews data
                const mockReviews = Array.from({ length: 10 }, (_, i) => ({
                    id: i.toString(),
                    name: `Reviewer ${i + 1}`,
                    rating: Math.floor(Math.random() * 5) + 1,
                    content: "This is a sample review content that would typically come from the actual review.",
                    time: "2 days ago",
                    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'neutral' | 'negative',
                    avatar: "JD"
                }));
                setReviews(mockReviews);
                setSentimentStats(calculateSentimentStats(mockReviews));
            } catch (error) {
                console.error('Error fetching business details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchBusinessDetails();
        }
    }, [session, calculateSentimentStats]);

    if (!session) {
        redirect('/login');
    }

    if (isLoading || !business) {
        return <div>Loading...</div>;
    }

    const handleUnclaim = async () => {
        try {
            const response = await fetch('/api/places/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    placeId: params.placeId,
                    name: business.name,
                    address: business.address,
                }),
            });

            if (response.ok) {
                // Redirect to dashboard after unclaiming
                redirect('/dashboard');
            }
        } catch (error) {
            console.error('Error unclaiming business:', error);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="grid md:grid-cols-[350px,1fr] gap-8">
                <div className="space-y-6">
                    <LocationOverview
                        name={business.name}
                        rating={business.rating}
                        reviewCount={business.reviewCount}
                        address={business.address}
                        phone={business.phone}
                        status={business.status}
                        isOpen={business.isOpen}
                        onUnclaim={handleUnclaim}
                    />
                    <Card className="p-6">
                        <RatingBreakdown ratings={calculateRatingBreakdown(reviews)} />
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <SentimentAnalysis {...sentimentStats} />
                    </Card>
                    <ReviewList reviews={transformToReviewItems(reviews)} />
                </div>
            </div>
        </div>
    );
} 