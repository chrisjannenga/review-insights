'use client';

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ClaimedBusiness {
    id: string;
    placeId: string;
    name: string;
    address: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [claimedBusinesses, setClaimedBusinesses] = useState<ClaimedBusiness[]>([]);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

    useEffect(() => {
        const fetchClaimedBusinesses = async () => {
            try {
                const response = await fetch('/api/places/claimed');
                if (!response.ok) throw new Error('Failed to fetch claimed businesses');
                const data = await response.json();
                setClaimedBusinesses(data);
            } catch (error) {
                console.error('Error fetching claimed businesses:', error);
            } finally {
                setIsLoadingBusinesses(false);
            }
        };

        if (session) {
            fetchClaimedBusinesses();
        }
    }, [session]);

    if (!session) {
        redirect("/login");
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            router.push(`/results?q=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">My Businesses</h1>
                <p className="text-muted-foreground">
                    View and manage your claimed business locations.
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
                <div className="flex gap-2">
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for businesses to claim..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            'Search'
                        )}
                    </Button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingBusinesses ? (
                    <div className="col-span-full flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
                    </div>
                ) : claimedBusinesses.length === 0 ? (
                    <div className="col-span-full text-center">
                        <p className="text-muted-foreground mb-4">You haven&apos;t claimed any businesses yet.</p>
                        <Button asChild>
                            <Link href="/search">Find Your Business</Link>
                        </Button>
                    </div>
                ) : (
                    claimedBusinesses.map((business) => (
                        <Card key={business.id}>
                            <CardHeader>
                                <CardTitle>{business.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{business.address}</p>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" asChild>
                                        <Link href={`/business/${business.placeId}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
} 