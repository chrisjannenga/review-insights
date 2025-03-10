"use client"

import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LocationOverview } from "@/components/location-overview"
import { RatingBreakdown } from "@/components/rating-breakdown"
import { SentimentAnalysis } from "@/components/sentiment-analysis"
import { ReviewList } from "@/components/review-list"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface LocationDetailProps {
    location: {
        id: string;
        name: string;
        rating: number;
        reviewCount: number;
        address: string;
        phone: string;
        status: string;
        isOpen: boolean;
        photoUrl?: string;
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
    };
}

export function LocationDetail({ location }: LocationDetailProps) {
    const [isClaimed, setIsClaimed] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleClaimToggle = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/places/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    placeId: location.id,
                    name: location.name,
                    address: location.address,
                })
            })

            if (!response.ok) {
                throw new Error('Failed to update claim status')
            }

            const data = await response.json()
            setIsClaimed(data.claimed)

            // Redirect to dashboard after unclaiming
            if (!data.claimed) {
                router.push('/dashboard')
            } else {
                router.refresh() // Refresh the page data
            }
        } catch (error) {
            console.error('Error updating claim status:', error)
            // You might want to show a toast notification here
        } finally {
            setIsLoading(false)
        }
    }

    const handleLoadMore = () => {
        console.log("Load more reviews clicked")
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 bg-muted/40">
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="space-y-6">
                        {/* Location Overview */}
                        <LocationOverview
                            name={location.name}
                            rating={location.rating}
                            reviewCount={location.reviewCount}
                            address={location.address}
                            phone={location.phone}
                            status={location.status}
                            isOpen={location.isOpen}
                            photoUrl={location.photoUrl}
                            onUnclaim={handleClaimToggle}
                            isLoading={isLoading}
                            isClaimed={isClaimed}
                        />

                        {/* Reviews Section */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Reviews <span className="text-muted-foreground">({location.reviews.length})</span>
                            </h2>
                            <select className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm">
                                <option>All Reviews</option>
                                <option>Recent</option>
                                <option>Oldest</option>
                            </select>
                        </div>

                        {/* Rating Breakdown */}
                        <RatingBreakdown ratings={location.ratingBreakdown} />

                        {/* Sentiment Analysis */}
                        <SentimentAnalysis
                            positive={location.sentiment.positive}
                            neutral={location.sentiment.neutral}
                            negative={location.sentiment.negative}
                            analysis={location.sentiment.analysis}
                        />

                        {/* Customer Reviews */}
                        <ReviewList reviews={location.reviews} onLoadMore={handleLoadMore} />
                    </div>
                </div>
            </main>
        </div>
    )
}

