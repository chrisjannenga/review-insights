import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Review Insights - Business Review Analytics",
  description: "Understand your customer sentiment at a glance with our powerful review analytics platform.",
  openGraph: {
    title: "Review Insights - Business Review Analytics",
    description: "Understand your customer sentiment at a glance with our powerful review analytics platform.",
    url: "https://review-insights.vercel.app",
    siteName: "Review Insights",
    locale: "en_US",
    type: "website",
    images: [{
      url: "opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "Review Insights - Business Review Analytics"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Review Insights - Business Review Analytics",
    description: "Understand your customer sentiment at a glance with our powerful review analytics platform.",
    images: ["opengraph-image.png"]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
      <Analytics />
    </html>
  );
}