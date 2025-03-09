import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export interface RatingItem {
  stars: number
  percentage: number
}

export interface RatingBreakdownProps {
  ratings: RatingItem[]
}

export function RatingBreakdown({ ratings }: RatingBreakdownProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          {ratings.map((item) => (
            <div key={item.stars} className="flex items-center">
              <div className="w-12 text-sm">{item.stars} stars</div>
              <div className="flex-1 mx-4">
                <Progress value={item.percentage} className="h-2" />
              </div>
              <div className="w-12 text-sm text-right">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

