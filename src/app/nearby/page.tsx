'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/SearchBar'
import { DishCard } from '@/components/DishCard'
import { 
  MapPin, 
  List, 
  Map, 
  Filter,
  SlidersHorizontal
} from 'lucide-react'

// Mock data for demonstration
const nearbyDishes = [
  {
    id: '1',
    name: 'Smashburger Deluxe',
    description: 'Juicy beef patty with caramelized onions and special sauce',
    tags: ['signature', 'burger', 'smashburger'],
    mustOrder: true,
    destinationWorthyScore: 85,
    trendCache: 12.5,
    photos: [{ url: 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=Smashburger' }],
    reviews: [{ rating: 4.8 }, { rating: 5.0 }, { rating: 4.6 }],
    votes: [{ id: '1' }, { id: '2' }, { id: '3' }],
    restaurant: {
      id: '1',
      name: 'Burger Joint',
      city: 'Austin',
      priceLevel: 2,
      lat: 30.2672,
      lng: -97.7431
    }
  },
  {
    id: '2',
    name: 'Brisket Tacos',
    description: 'Slow-smoked brisket with house-made tortillas',
    tags: ['signature', 'bbq', 'taco'],
    mustOrder: true,
    destinationWorthyScore: 92,
    trendCache: 15.2,
    photos: [{ url: 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=Brisket+Tacos' }],
    reviews: [{ rating: 5.0 }, { rating: 4.9 }, { rating: 5.0 }],
    votes: [{ id: '4' }, { id: '5' }, { id: '6' }, { id: '7' }],
    restaurant: {
      id: '2',
      name: 'BBQ Palace',
      city: 'Austin',
      priceLevel: 3,
      lat: 30.2672,
      lng: -97.7431
    }
  }
]

export default function NearbyPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    tags: [] as string[],
    priceLevel: null as number | null,
    radius: 10
  })

  useEffect(() => {
    // Request user location on page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: Implement search functionality
  }

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Must-Orders Near Me</h1>
          <p className="text-gray-600 mb-6">
            Discover the best dishes at restaurants near you
          </p>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                onSearch={handleSearch}
                onLocationRequest={handleLocationRequest}
                placeholder="Search for dishes, restaurants, or cuisines..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
                className="flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                Map
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Location Status */}
          {userLocation ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>Location found! Showing results within {filters.radius}km</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>Location access needed to show nearby results</span>
              <Button size="sm" onClick={handleLocationRequest}>
                Allow Location
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyDishes.map((dish) => (
              <DishCard 
                key={dish.id} 
                dish={dish} 
                userLocation={userLocation || undefined}
              />
            ))}
          </div>
        ) : (
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <div className="text-center text-gray-500">
                <Map className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Map view coming soon!</p>
                <p className="text-sm">Leaflet integration will be added here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {nearbyDishes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <p className="text-lg mb-2">No dishes found nearby</p>
                <p className="text-sm">Try adjusting your search or location</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
