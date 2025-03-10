'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";

export function SiteHeader() {
    const { data: session } = useSession();

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary h-6 w-6 flex items-center justify-center text-white text-xs font-bold rounded">
                        R
                    </div>
                    <span className="text-xl font-bold">Review Insights</span>
                </Link>

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                    <Badge>Demo</Badge>
                </div>
            </div>
        </header>
    );
} 