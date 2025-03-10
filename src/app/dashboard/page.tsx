'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface ClaimedBusiness {
    id: string;
    placeId: string;
    name: string;
    address: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
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

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Locations</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and monitor your business locations
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingBusinesses ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : claimedBusinesses.length === 0 ? (
                    <div className="col-span-full bg-muted/30 rounded-lg p-12 text-center">
                        <h3 className="text-xl font-semibold mb-2">No businesses claimed yet</h3>
                        <p className="text-muted-foreground mb-6">Get started by claiming your first business location. Use the search bar above to find your locations.</p>
                    </div>
                ) : (
                    claimedBusinesses.map((business) => (
                        <Card key={business.id} className="relative">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{business.name}</CardTitle>
                                <Button variant="outline" size="sm" asChild className="absolute top-4 right-4">
                                    <Link href={`/locations/${business.placeId}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mt-2">{business.address}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
} 