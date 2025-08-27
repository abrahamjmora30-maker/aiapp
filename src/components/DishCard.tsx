'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VoteButton } from './VoteButton'
import { TrendBadge } from './TrendBadge'
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react'
import { cn, formatRating, formatDistance, getPlaceholderImage } from '@/lib/utils'

interface DishCardProps {
  dish: {
    id: string
    name: string
    description?: string
    howToOrder?: string
    tags: string[]
    mustOrder: boolean
    destinationWorthyScore: number
    trendCache: number
    photos: Array<{ url: string; caption?: string }>
    reviews: Array<{ rating: number }>
    votes: Array<{ id: string }>
    restaurant: {
      id: string
      name: string
      city: string
      priceLevel?: number
      lat?: number
      lng?: number
    }
  }
  userLocation?: { lat: number; lng: number }
  className?: string
}

export function DishCard({ dish, userLocation, className }: DishCardProps) {
  const avgRating = dish.reviews.length > 0 
    ? dish.reviews.reduce((sum, r) => sum + r.rating, 0) / dish.reviews.length 
    : 0

  const distance = userLocation && dish.restaurant.lat && dish.restaurant.lng
    ? formatDistance(calculateDistance(
        userLocation.lat,
        userLocation.lng,
        dish.restaurant.lat,
        dish.restaurant.lng
      ))
    : null

  const mainPhoto = dish.photos[0]?.url || getPlaceholderImage(400, 300)

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <div className="relative">
        <Image
          src={mainPhoto}
          alt={dish.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {dish.mustOrder && (
            <Badge variant="destructive" className="bg-red-600">
              Must Order
            </Badge>
          )}
          <TrendBadge score={dish.trendCache} />
        </div>
        <div className="absolute top-2 right-2">
          <VoteButton dishId={dish.id} initialVotes={dish.votes.length} />
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{dish.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="font-medium">{dish.restaurant.name}</span>
              <span>•</span>
              <span>{dish.restaurant.city}</span>
              {distance && (
                <>
                  <span>•</span>
                  <span>{distance}</span>
                </>
              )}
            </div>
          </div>
          {dish.restaurant.priceLevel && (
            <Badge variant="outline" className="text-xs">
              {'$'.repeat(dish.restaurant.priceLevel)}
            </Badge>
          )}
        </div>

        {dish.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {dish.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{formatRating(avgRating)}</span>
            <span className="text-muted-foreground">({dish.reviews.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{dish.votes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{dish.reviews.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {dish.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {dish.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{dish.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
