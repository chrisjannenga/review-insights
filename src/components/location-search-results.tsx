"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { ArrowLeft, MapPin, Phone, Star, Search, Menu, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { RatingBreakdown } from "@/components/rating-breakdown"
import { SentimentAnalysis } from "@/components/sentiment-analysis"
import { ReviewList } from "@/components/review-list"

interface LocationSearchResultsProps {
  initialQuery: string;
  initialLocations: Array<{
    id: string | number;
    name: string;
    rating: number;
    reviews: number;
    address?: string;
    phone?: string;
    isOpen?: boolean;
    status?: string;
    image: string;
    placeId?: string;
  }>;
  initialReviews: Array<{
    id: string | number;
    name: string;
    avatar: string;
    rating: number;
    sentiment: string;
    time: string;
    content: string;
    profilePhotoUrl?: string;
    locationId: string | number;
  }>;
  onLocationSelect?: (locationId: string) => void;
  onLoadMoreReviews?: () => void;
  hasMoreReviews?: boolean;
  loadingMoreReviews?: boolean;
  session: Session | null;
}

interface Review {
  rating: number;
  sentiment: string;
  content: string;
  locationId: string | number;
}

// Move these outside the component to prevent recreation on each render
const calculateRatingBreakdown = (reviews: Review[]) => {
  const breakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = Math.round((count / reviews.length) * 100) || 0;
    return { stars, percentage };
  });
  return breakdown;
};

export default function LocationSearchResults({
  initialQuery,
  initialLocations = [],
  initialReviews = [],
  onLocationSelect,
  onLoadMoreReviews,
  hasMoreReviews,
  loadingMoreReviews,
  session
}: LocationSearchResultsProps) {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState(initialLocations[0])
  const [filterType, setFilterType] = useState("all")
  const [locations] = useState(initialLocations)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [visibleLocations, setVisibleLocations] = useState(3)
  const [claimedLocations, setClaimedLocations] = useState<Record<string, boolean>>({})
  const [isClaimingLocation, setIsClaimingLocation] = useState<Record<string, boolean>>({})
  const [sentimentDataMap, setSentimentDataMap] = useState<Record<string, {
    positive: number;
    negative: number;
    neutral: number;
    analysis: string;
  }>>({});
  const [loadingSentiment, setLoadingSentiment] = useState<Record<string, boolean>>({});
  const claimChecksCompleted = useRef(false)
  const pendingSentimentRequests = useRef<Record<string | number, boolean>>({});

  console.log('Session state:', {
    isAuthenticated: !!session?.user,
    user: session?.user,
  });

  console.log('Locations state:', {
    initialLocations,
    locations,
    selectedLocation,
    claimedLocations,
    isClaimingLocation
  });

  // Memoize filtered reviews to prevent unnecessary recalculations
  const filteredReviews = useMemo(() => {
    return initialReviews
      .filter((review) => filterType === "all" || review.sentiment === filterType)
      .slice(0, 10);
  }, [initialReviews, filterType]);

  // Batch check all location claims once on mount
  useEffect(() => {
    const checkAllClaims = async () => {
      if (!session?.user || claimChecksCompleted.current) return;

      try {
        const placeIds = initialLocations
          .map(loc => loc.placeId)
          .filter((id): id is string => !!id);

        if (placeIds.length === 0) return;

        const claims: Record<string, boolean> = {};

        // Process claims in parallel
        await Promise.all(
          placeIds.map(async (placeId) => {
            try {
              const response = await fetch(`/api/places/claim?placeId=${placeId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) throw new Error("Failed to check claim status");

              const data = await response.json();
              claims[placeId] = data.claimed;
            } catch (error) {
              console.error(`Error checking claim for ${placeId}:`, error);
              claims[placeId] = false;
            }
          })
        );

        setClaimedLocations(claims);
        claimChecksCompleted.current = true;
      } catch (error) {
        console.error("Error checking claims:", error);
      }
    };

    checkAllClaims();

    // Reset on unmount
    return () => {
      claimChecksCompleted.current = false;
    };
  }, [session?.user, initialLocations]);

  const handleLocationClick = useCallback((location: typeof initialLocations[0]) => {
    console.log('\n🔵 handleLocationClick START', {
      locationId: location?.id,
      hasCachedData: location?.id ? !!sentimentDataMap[location.id] : false,
    });

    if (!location?.id) return;

    // Only update if the location has changed
    if (selectedLocation?.id !== location.id) {
      setSelectedLocation(location);

      if (onLocationSelect) {
        console.log('🎯 Calling onLocationSelect with:', location.id.toString());
        onLocationSelect(location.id.toString());
      }

      // Only set loading if we don't have cached data
      if (!sentimentDataMap[location.id]) {
        console.log('🔄 Setting loading state to true for location:', location.id);
        setLoadingSentiment(prev => ({ ...prev, [location.id]: true }));
      }
    }

    console.log('🔵 handleLocationClick END\n');
  }, [onLocationSelect, selectedLocation, sentimentDataMap]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [searchQuery, router]);

  const handleClaimLocation = useCallback(async (locationId: string | undefined) => {
    if (!locationId) {
      console.error("Cannot claim location: missing placeId");
      return;
    }

    setIsClaimingLocation(prev => ({ ...prev, [locationId]: true }));

    try {
      const response = await fetch("/api/places/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: locationId,
          action: claimedLocations[locationId] ? "unclaim" : "claim",
        }),
      });

      if (!response.ok) throw new Error("Failed to claim location");

      await response.json();
      setClaimedLocations(prev => ({
        ...prev,
        [locationId]: !prev[locationId],
      }));
    } catch (error) {
      console.error("Error claiming location:", error);
    } finally {
      setIsClaimingLocation(prev => ({ ...prev, [locationId]: false }));
    }
  }, [claimedLocations]);

  // Calculate sentiment percentages for a specific location
  const calculateSentimentPercentages = useCallback(async (locationId: string | number) => {
    console.log('\n🟡 calculateSentimentPercentages START', {
      locationId,
      hasCachedData: !!sentimentDataMap[locationId],
      isPending: pendingSentimentRequests.current[locationId],
    });

    // If we already have the sentiment data or a request is pending, return early
    if (sentimentDataMap[locationId] || pendingSentimentRequests.current[locationId]) {
      console.log('📦 Found cached data or pending request, returning early');
      setLoadingSentiment(prev => ({ ...prev, [locationId]: false }));
      return;
    }

    // Mark this request as pending
    pendingSentimentRequests.current[locationId] = true;

    try {
      console.log('🔍 Filtering reviews for location:', locationId);
      const locationReviews = initialReviews.filter(review => review.locationId === locationId);
      const total = locationReviews.length;

      if (total === 0) {
        console.log('⚠️ No reviews found for location');
        setSentimentDataMap(prev => ({
          ...prev,
          [locationId]: {
            positive: 0,
            negative: 0,
            neutral: 0,
            analysis: 'No reviews available for sentiment analysis.'
          }
        }));
        return;
      }

      const positive = locationReviews.filter(r => r.sentiment === 'positive').length;
      const negative = locationReviews.filter(r => r.sentiment === 'negative').length;
      const neutral = locationReviews.filter(r => r.sentiment === 'neutral').length;

      let analysis = `Based on ${total} reviews, ${positive} are positive, ${neutral} are neutral, and ${negative} are negative.`;

      try {
        console.log('🌐 Fetching sentiment analysis from API');
        const response = await fetch('/api/analyze-sentiment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviews: locationReviews.map(review => review.content)
          }),
        });

        if (!response.ok) throw new Error('Failed to analyze sentiment');

        const data = await response.json();
        analysis = data.analysis;
        console.log('✅ API call successful');
      } catch (error) {
        console.error('❌ Error analyzing sentiment:', error);
      }

      const result = {
        positive: Math.round((positive / total) * 100) || 0,
        negative: Math.round((negative / total) * 100) || 0,
        neutral: Math.round((neutral / total) * 100) || 0,
        analysis
      };

      console.log('💾 Updating sentiment data map with results');
      setSentimentDataMap(prev => ({
        ...prev,
        [locationId]: result
      }));

    } catch (error) {
      console.error('❌ Error in calculateSentimentPercentages:', error);
    } finally {
      setLoadingSentiment(prev => ({ ...prev, [locationId]: false }));
      // Clear the pending flag
      pendingSentimentRequests.current[locationId] = false;
    }

    console.log('🟡 calculateSentimentPercentages END\n');
  }, [initialReviews, sentimentDataMap]);

  // Update sentiment calculation effect
  useEffect(() => {
    if (!selectedLocation?.id) {
      console.log('⚪ No selected location, skipping');
      return;
    }

    // If we already have the data or a request is pending, don't recalculate
    if (sentimentDataMap[selectedLocation.id] || pendingSentimentRequests.current[selectedLocation.id]) {
      console.log('📦 Found cached data or pending request, skipping calculation');
      return;
    }

    console.log('🎯 Initiating sentiment calculation');
    calculateSentimentPercentages(selectedLocation.id);

  }, [selectedLocation?.id, calculateSentimentPercentages, sentimentDataMap]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Full Width */}
      <header className="w-full bg-white border-b sticky top-0 z-10 px-0">
        <div className="container mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-800 pr-2">
                Review<span className="text-[#c1432e]">Insights</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search locations..."
                  className="pl-8 bg-white border-gray-200 focus:border-[#c1432e] focus:ring-[#c1432e]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Badge>Demo</Badge>
              {session?.user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button>Login / Sign Up</Button>
                </Link>
              )}
            </div>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Contained */}
      <main className="flex-1 w-full py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Search</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-[350px,1fr] gap-8">
            {/* Locations List */}
            <div className="space-y-4">
              {locations.slice(0, visibleLocations).map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${selectedLocation?.id === location.id ? "border-primary" : ""
                    }`}
                  onClick={() => handleLocationClick(location)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{location.name}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>{location.rating}</span>
                          <span className="text-muted-foreground">({location.reviews})</span>
                        </div>
                        {(() => {
                          console.log('Claim button conditions:', {
                            locationName: location.name,
                            hasSession: !!session?.user,
                            hasPlaceId: !!location.placeId,
                            placeId: location.placeId,
                            isClaimed: location.placeId ? claimedLocations[location.placeId] : undefined,
                            isClaimingInProgress: location.placeId ? isClaimingLocation[location.placeId] : undefined
                          });
                          return null;
                        })()}
                        {session?.user && location.placeId && (
                          <Button
                            variant={claimedLocations[location.placeId] ? "destructive" : "default"}
                            size="sm"
                            disabled={isClaimingLocation[location.placeId]}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaimLocation(location.placeId);
                            }}
                          >
                            {isClaimingLocation[location.placeId] ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : claimedLocations[location.placeId] ? (
                              "Unclaim"
                            ) : (
                              "Claim"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {location.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{location.address}</span>
                      </div>
                    )}
                    {location.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{location.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      {location.isOpen && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Open
                        </Badge>
                      )}
                      {location.status && (
                        <Badge variant="outline">{location.status}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {locations.length > visibleLocations && (
                <Button
                  className="w-full mt-4 bg-[#c1432e] text-white hover:bg-[#a93826]"
                  onClick={() => setVisibleLocations(locations.length)}
                >
                  See More Locations ({locations.length - visibleLocations} remaining)
                </Button>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <span className="text-muted-foreground text-lg">({filteredReviews.length})</span>
                </div>
                <div className="flex items-center gap-2">

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border rounded-md px-2 py-1"
                  >
                    <option value="all">All Reviews</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              {/* Review Overview Sections */}
              <div className="space-y-8">
                {/* Rating Breakdown Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                  <RatingBreakdown ratings={calculateRatingBreakdown(filteredReviews)} />
                </div>

                {/* Sentiment Analysis Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                  {selectedLocation?.id ? (
                    <SentimentAnalysis
                      {...(sentimentDataMap[selectedLocation.id] || {
                        positive: 0,
                        negative: 0,
                        neutral: 0,
                        analysis: ''
                      })}
                      isLoading={loadingSentiment[selectedLocation.id] || false}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Select a location to view sentiment analysis
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Customer Reviews Section */}
                <div>

                  <ReviewList
                    reviews={filteredReviews.map(review => ({
                      id: review.id.toString(),
                      author: review.name,
                      content: review.content,
                      date: review.time,
                      rating: review.rating,
                      sentiment: review.sentiment as "positive" | "neutral" | "negative"
                    }))}
                    onLoadMore={onLoadMoreReviews}
                  />

                  {filteredReviews.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No reviews found for the selected filter.
                    </div>
                  )}

                  {hasMoreReviews && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        onClick={onLoadMoreReviews}
                        disabled={loadingMoreReviews}
                        className="px-8"
                      >
                        {loadingMoreReviews ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More Reviews'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Full Width */}
      <footer className="w-full bg-gray-900 text-white py-12 px-0">
        <div className="container mx-auto">
          <div className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Review<span className="text-[#c1432e]">Insights</span>
                </h3>
                <p className="text-gray-400">
                  Helping business owners understand customer sentiment and improve their service through data-driven
                  insights.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Subscribe to Our Newsletter</h4>
                <div className="flex">
                  <Input type="email" placeholder="Your email" className="bg-gray-800 border-gray-700 text-white" />
                  <Button className="ml-2 bg-[#c1432e] hover:bg-[#a93826]">Subscribe</Button>
                </div>
                <p className="mt-4 text-sm text-gray-400">Get the latest insights and updates delivered to your inbox.</p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 ReviewInsights. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Terms & Conditions
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


