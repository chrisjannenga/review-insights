import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { db } from "@/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface GooglePlace {
    place_id: string;
    name: string;
    formatted_address: string;
    rating: number;
    user_ratings_total: number;
}

async function searchPlaces(query: string): Promise<GooglePlace[]> {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            query
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();
    return data.results;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const session = await getServerSession(authOptions);
    const query = searchParams.q || "";

    // Only fetch results if there's a query
    const searchResults = query ? await searchPlaces(query) : [];

    // Get user's claimed businesses to check against search results
    const userClaimedBusinesses = session ? await db.query.claimedBusinesses.findMany({
        where: (businesses, { eq }) => eq(businesses.userId, session.user.id),
    }) : [];

    const claimedPlaceIds = new Set(userClaimedBusinesses.map(b => b.placeId));

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary h-6 w-6 flex items-center justify-center text-white text-xs font-bold rounded">R</div>
                    <span className="text-xl font-bold">Review Insights</span>
                </Link>
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <form action="/api/auth/signout" method="POST">
                                <Button variant="ghost" type="submit">Logout</Button>
                            </form>
                        </>
                    ) : (
                        <Button asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                    <Badge>Demo</Badge>
                </div>
            </header>

            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {query ? "Search Results" : "Find Your Business"}
                </h1>
                <p className="text-muted-foreground">
                    {query
                        ? `Showing results for "${query}"`
                        : "Search for your business to claim and manage your listing."}
                </p>
            </div>

            <form className="w-full max-w-2xl">
                <div className="flex gap-2">
                    <Input
                        type="search"
                        name="q"
                        placeholder="Enter business name or location..."
                        defaultValue={query}
                        className="flex-1"
                    />
                    <Button type="submit">Search</Button>
                </div>
            </form>

            {query && (
                <div className="grid gap-6">
                    {searchResults.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
                        </div>
                    ) : (
                        searchResults.map((place) => (
                            <div
                                key={place.place_id}
                                className="border rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                                <div className="space-y-2">
                                    <h3 className="font-semibold">{place.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {place.formatted_address}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 fill-primary text-primary" />
                                        <span className="text-sm font-medium">
                                            {place.rating}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({place.user_ratings_total} reviews)
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button variant="outline" asChild>
                                        <a href={`/business/${place.place_id}`}>View Details</a>
                                    </Button>
                                    {session ? (
                                        claimedPlaceIds.has(place.place_id) ? (
                                            <Button variant="secondary" disabled>
                                                Already Claimed
                                            </Button>
                                        ) : (
                                            <form action="/api/businesses/claim" method="POST">
                                                <input type="hidden" name="placeId" value={place.place_id} />
                                                <input type="hidden" name="name" value={place.name} />
                                                <input type="hidden" name="address" value={place.formatted_address} />
                                                <Button type="submit">Claim Business</Button>
                                            </form>
                                        )
                                    ) : (
                                        <Button asChild>
                                            <a href="/login">Sign in to Claim</a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
} 