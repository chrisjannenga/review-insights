"use client"

import { Button } from "@/components/ui/button"
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
          <ReviewItem key={review.id} {...review} />
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}

