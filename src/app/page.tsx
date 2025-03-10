'use client';

import { Search, Star, BarChart2, MapPin, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

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
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section with Search */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background z-0" />
          <div className="container relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Get <span className="text-primary">Early Access</span> to Customer Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-12">
              Uncover valuable insights from customer reviews across all your locations with our powerful sentiment
              analysis platform.
            </p>

            <div className="w-full max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Enter your business name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-4 pr-12 py-6 text-lg h-16 rounded-full shadow-lg bg-background text-foreground"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">50K+ Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Sentiment Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Real-time Insights</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Insights at Your Fingertips</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our platform helps you understand customer sentiment across all your business locations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-xl shadow-sm border border-primary/10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sentiment Analysis</h3>
                <p className="text-muted-foreground">
                  Automatically analyze customer reviews to identify positive and negative sentiment patterns.
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-sm border border-primary/10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Location Comparison</h3>
                <p className="text-muted-foreground">
                  Compare performance across multiple locations to identify strengths and improvement areas.
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-sm border border-primary/10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trend Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor sentiment trends over time to measure the impact of your business improvements.
                </p>
              </div>
            </div>

            <div className="mt-20">
              <div className="bg-background rounded-xl overflow-hidden shadow-lg border border-primary/10">
                <div className="grid md:grid-cols-2 items-center">
                  <div className="p-8 md:p-12">
                    <h3 className="text-2xl font-bold mb-4">Comprehensive Dashboard</h3>
                    <p className="text-muted-foreground mb-6">
                      Get a bird&apos;s-eye view of your business reputation with our intuitive dashboard. Track sentiment
                      across locations, identify key themes, and spot opportunities for improvement.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-white">See Demo</Button>
                  </div>
                  <div className="bg-primary/10 p-8">
                    <Image
                      src="/dashboard-preview.svg"
                      alt="Dashboard Preview"
                      width={600}
                      height={400}
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Business Owners</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how Review Insights has helped businesses understand their customers better.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-background p-8 rounded-xl shadow-sm border border-primary/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">SJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Restaurant Owner</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &ldquo;Review Insights helped us identify that customers loved our food but had concerns about wait times.
                  After making operational changes, our sentiment scores improved by 35% in just two months.&rdquo;
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-sm border border-primary/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">MC</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Retail Chain Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &ldquo;Managing 12 locations was overwhelming until we found Review Insights. Now we can quickly identify
                  which stores need attention and what specific issues customers are mentioning.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Understand Your Customers?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
              Join thousands of businesses that use Review Insights to improve customer satisfaction and drive growth.
            </p>

            <div className="w-full max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Enter your business name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-4 pr-12 py-6 text-lg h-16 rounded-full shadow-lg bg-background text-foreground"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>

            <p className="text-sm mt-4 text-white/80">No credit card required. Start with our free plan today.</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="bg-primary h-5 w-5 flex items-center justify-center text-white text-xs font-bold rounded">R</div>
              <span className="text-lg font-bold">Review Insights</span>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-4 justify-center mb-6 md:mb-0">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-primary">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary">
                Pricing
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                Blog
              </Link>
            </nav>

            <div className="text-sm text-muted-foreground">
              © 2024 Review Insights. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
