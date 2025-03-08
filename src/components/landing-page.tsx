import { Search, Star, BarChart2, MapPin, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="bg-shopd h-6 w-6 flex items-center justify-center text-white text-xs font-bold">R</div>
            <span className="text-xl font-bold">Review Insights</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-shopd">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-shopd">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-shopd">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-shopd hidden sm:inline-block">
              Log in
            </Link>
            <Button className="bg-shopd hover:bg-shopd-dark text-white">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Search */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-shopd/10 to-background z-0"></div>
          <div className="container relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Get <span className="text-shopd">Early Access</span> to Customer Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-12">
              Uncover valuable insights from customer reviews across all your locations with our powerful sentiment
              analysis platform.
            </p>

            <div className="w-full max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter your business name..."
                  className="pl-4 pr-12 py-6 text-lg h-16 rounded-full shadow-lg"
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-shopd hover:bg-shopd-dark"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Search across 100+ review platforms instantly</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-shopd/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-shopd" />
                </div>
                <span className="text-sm font-medium">50K+ Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-shopd/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-shopd" />
                </div>
                <span className="text-sm font-medium">100+ Review Platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-shopd/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-shopd" />
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
              <div className="bg-background p-8 rounded-xl shadow-sm border border-shopd/10">
                <div className="h-12 w-12 rounded-lg bg-shopd/10 flex items-center justify-center mb-6">
                  <Star className="h-6 w-6 text-shopd" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sentiment Analysis</h3>
                <p className="text-muted-foreground">
                  Automatically analyze customer reviews to identify positive and negative sentiment patterns.
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-sm border border-shopd/10">
                <div className="h-12 w-12 rounded-lg bg-shopd/10 flex items-center justify-center mb-6">
                  <MapPin className="h-6 w-6 text-shopd" />
                </div>
                <h3 className="text-xl font-bold mb-3">Location Comparison</h3>
                <p className="text-muted-foreground">
                  Compare performance across multiple locations to identify strengths and improvement areas.
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-sm border border-shopd/10">
                <div className="h-12 w-12 rounded-lg bg-shopd/10 flex items-center justify-center mb-6">
                  <BarChart2 className="h-6 w-6 text-shopd" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trend Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor sentiment trends over time to measure the impact of your business improvements.
                </p>
              </div>
            </div>

            <div className="mt-20">
              <div className="bg-background rounded-xl overflow-hidden shadow-lg border border-shopd/10">
                <div className="grid md:grid-cols-2 items-center">
                  <div className="p-8 md:p-12">
                    <h3 className="text-2xl font-bold mb-4">Comprehensive Dashboard</h3>
                    <p className="text-muted-foreground mb-6">
                      Get a bird's-eye view of your business reputation with our intuitive dashboard. Track sentiment
                      across locations, identify key themes, and spot opportunities for improvement.
                    </p>
                    <Button className="bg-shopd hover:bg-shopd-dark text-white">See Demo</Button>
                  </div>
                  <div className="bg-shopd h-full">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Dashboard Preview"
                      width={600}
                      height={400}
                      className="object-cover h-full w-full mix-blend-luminosity opacity-90"
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
              <div className="bg-background p-8 rounded-xl shadow-sm border border-shopd/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-shopd/20 flex items-center justify-center">
                    <span className="text-shopd font-bold">SJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Restaurant Owner</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Review Insights helped us identify that customers loved our food but had concerns about wait times.
                  After making operational changes, our sentiment scores improved by 35% in just two months."
                </p>
              </div>

              <div className="bg-background p-8 rounded-xl shadow-sm border border-shopd/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-shopd/20 flex items-center justify-center">
                    <span className="text-shopd font-bold">MC</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Retail Chain Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Managing 12 locations was overwhelming until we found Review Insights. Now we can quickly identify
                  which stores need attention and what specific issues customers are mentioning."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 shopd-gradient text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Understand Your Customers?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
              Join thousands of businesses that use Review Insights to improve customer satisfaction and drive growth.
            </p>

            <div className="w-full max-w-xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter your business name..."
                  className="pl-4 pr-12 py-6 text-lg h-16 rounded-full shadow-lg bg-background text-foreground"
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-shopd hover:bg-shopd-dark"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <p className="text-sm mt-4 text-white/80">No credit card required. Start with our free plan today.</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="bg-shopd h-5 w-5 flex items-center justify-center text-white text-xs font-bold">R</div>
              <span className="text-lg font-bold">Review Insights</span>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-4 justify-center mb-6 md:mb-0">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-shopd">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-shopd">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-shopd">
                Pricing
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-shopd">
                Blog
              </Link>
            </nav>

            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:text-shopd">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:text-shopd">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:text-shopd">
                <BarChart2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} Review Insights. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-shopd">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-shopd">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

