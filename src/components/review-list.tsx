"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ReviewItem, type ReviewItemProps } from "./review-item"

export interface ReviewListProps {
  reviews: ReviewItemProps[]
  onLoadMore?: () => void
}

export function ReviewList({ reviews, onLoadMore }: ReviewListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Customer Reviews</h2>
        <Button variant="outline" size="sm">
          All Reviews
        </Button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{review.author}</div>
                <div className="text-sm text-muted-foreground">{review.date}</div>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1">{review.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.content}</p>
          </Card>
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="flex justify-center mt-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                disabled={true}
                className="px-8"
              >
                Load More Reviews
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">Google API's only allow 5 reviews per location unless you buy a premium API membership</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

