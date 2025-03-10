"use client"

import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function Header() {
    const { data: session } = useSession()
    const [searchQuery, setSearchQuery] = useState("")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`)
            setIsMobileMenuOpen(false)
        }
    }

    const isHomePage = pathname === '/'

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <header className="w-full bg-white border-b sticky top-0 z-50">
            <div className="container mx-auto">
                <div className="px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-gray-800 pr-2">
                            Review<span className="text-[#c1432e]">Insights</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-4">
                        {!isHomePage && (
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
                        )}
                        {session?.user ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="default">Dashboard</Button>
                                </Link>
                                <Button variant="outline" onClick={() => signOut()}>
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button>Login / Sign Up</Button>
                            </Link>
                        )}
                    </div>

                    <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t px-4 py-4 space-y-4 bg-white">
                        {!isHomePage && (
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search locations..."
                                    className="pl-8 w-full bg-white border-gray-200 focus:border-[#c1432e] focus:ring-[#c1432e]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                        )}
                        <div className="flex flex-col space-y-2">
                            {session?.user ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="default" className="w-full">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false)
                                            signOut()
                                        }}
                                    >
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full">Login / Sign Up</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
} 