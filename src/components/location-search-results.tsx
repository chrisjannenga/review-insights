"use client"

import { useState } from "react"
import { ArrowLeft, MapPin, Phone, Star, Filter, Search, Menu, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

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
  }>;
  onLocationSelect?: (locationId: string) => void;
  onLoadMoreReviews?: () => void;
  hasMoreReviews?: boolean;
  loadingMoreReviews?: boolean;
}

export default function LocationSearchResults({
  initialQuery,
  initialLocations = [],
  initialReviews = [],
  onLocationSelect,
  onLoadMoreReviews,
  hasMoreReviews,
  loadingMoreReviews
}: LocationSearchResultsProps) {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState(initialLocations[0])
  const [filterType, setFilterType] = useState("all")
  const [locations] = useState(initialLocations)
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const handleLocationClick = (location: typeof initialLocations[0]) => {
    setSelectedLocation(location)
    if (onLocationSelect) {
      onLocationSelect(location.id.toString())
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const filteredReviews = initialReviews
    .filter((review) => filterType === "all" || review.sentiment === filterType)
    .slice(0, 10)

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
              {locations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${selectedLocation?.id === location.id ? "border-primary" : ""
                    }`}
                  onClick={() => handleLocationClick(location)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{location.name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{location.rating}</span>
                        <span className="text-muted-foreground">({location.reviews})</span>
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
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <span className="text-muted-foreground">({filteredReviews.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
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

              {/* Review Overview Section */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-[2fr,1fr] gap-6">
                    {/* Rating Breakdown */}
                    <div className="pr-6">
                      <h3 className="text-lg font-semibold mb-3">Rating Breakdown</h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = initialReviews.filter(r => r.rating === rating).length;
                          const percentage = Math.round((count / initialReviews.length) * 100) || 0;
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center w-20">
                                <span className="text-sm">{rating}</span>
                                <span className="text-sm text-muted-foreground ml-1">stars</span>
                              </div>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-12 text-sm text-muted-foreground text-right">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sentiment Analysis */}
                    <div className="border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0">
                      <h3 className="text-lg font-semibold mb-3">Sentiment Analysis</h3>
                      <div className="space-y-3">
                        {['positive', 'neutral', 'negative'].map((sentiment) => {
                          const count = initialReviews.filter(r => r.sentiment === sentiment).length;
                          const percentage = Math.round((count / initialReviews.length) * 100) || 0;
                          const color = sentiment === 'positive' ? 'text-green-600' :
                            sentiment === 'negative' ? 'text-red-600' :
                              'text-gray-600';
                          return (
                            <div key={sentiment} className="flex items-center gap-3 justify-end">
                              <span className={`text-lg font-semibold ${color} w-16 text-right`}>
                                {percentage}%
                              </span>
                              <span className="capitalize text-muted-foreground text-sm w-16">{sentiment}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {review.profilePhotoUrl ? (
                            <Image
                              src={review.profilePhotoUrl}
                              alt={review.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <Avatar>
                              <AvatarFallback>{review.avatar}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <CardTitle className="text-base">{review.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{review.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              review.sentiment === "positive"
                                ? "outline"
                                : review.sentiment === "negative"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {review.sentiment}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="ml-1">{review.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{review.content}</p>
                    </CardContent>
                  </Card>
                ))}

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

