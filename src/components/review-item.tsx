import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface ReviewItemProps {
  id: string
  author: string
  date: string
  rating: number
  content: string
  sentiment: "positive" | "neutral" | "negative"
}

export function ReviewItem({ author, date, rating, content, sentiment }: ReviewItemProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
              {author.charAt(0)}
            </div>
            <div className="ml-3">
              <div className="font-medium">{author}</div>
              <div className="text-sm text-muted-foreground">{date}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Badge
              variant="outline"
              className={
                sentiment === "positive"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : sentiment === "negative"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
              }
            >
              {sentiment}
            </Badge>
            <div className="flex items-center ml-3">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="ml-1 text-sm">{rating}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  )
}

