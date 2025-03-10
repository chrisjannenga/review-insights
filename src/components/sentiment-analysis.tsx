import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

export interface SentimentAnalysisProps {
  positive: number
  neutral: number
  negative: number
  analysis: string
  isLoading?: boolean
}

export function SentimentAnalysis({ positive, neutral, negative, analysis, isLoading = false }: SentimentAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Analyzing sentiment...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{positive}%</div>
            <div className="text-sm text-green-600">Positive</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-600">{neutral}%</div>
            <div className="text-sm text-slate-600">Neutral</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{negative}%</div>
            <div className="text-sm text-red-600">Negative</div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="text-base text-foreground">{analysis}</div>
      </CardContent>
    </Card>
  )
}

