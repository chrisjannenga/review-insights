"use client"

import { MapPin, Phone, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface LocationOverviewProps {
  name: string
  rating: number
  reviewCount: number
  address: string
  phone: string
  status: string
  isOpen?: boolean
  onUnclaim?: () => void
}

export function LocationOverview({
  name,
  rating,
  reviewCount,
  address,
  phone,
  status,
  isOpen = true,
  onUnclaim,
}: LocationOverviewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">{name}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary mr-1" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground ml-1">({reviewCount})</span>
            </div>
            <Button variant="destructive" size="sm" onClick={onUnclaim}>
              Unclaim
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-1 flex-shrink-0" />
              <span className="text-sm">{address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
              <span className="text-sm">{phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOpen && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Open
              </Badge>
            )}
            <Badge variant="outline">{status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

