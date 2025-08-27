import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/SearchBar'
import { DishCard } from '@/components/DishCard'
import { 
  MapPin, 
  TrendingUp, 
  Star, 
  Utensils,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const trendingDishes = [
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

const topCities = [
  { name: 'Austin', count: 156, slug: 'austin' },
  { name: 'New York', count: 234, slug: 'new-york' },
  { name: 'Los Angeles', count: 189, slug: 'los-angeles' },
  { name: 'Chicago', count: 145, slug: 'chicago' },
  { name: 'Miami', count: 98, slug: 'miami' },
  { name: 'Seattle', count: 87, slug: 'seattle' }
]

export default function HomePage() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query)
    // TODO: Implement search functionality
  }

  const handleLocationRequest = () => {
    console.log('Requesting location...')
    // TODO: Implement location request
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Never order the wrong thing again
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover the must-order dishes at any restaurant. From signature plates to trending favorites, 
            find exactly what to order for the best dining experience.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <SearchBar 
              onSearch={handleSearch}
              onLocationRequest={handleLocationRequest}
              placeholder="Search for dishes, restaurants, or cuisines..."
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Find Must-Orders Near Me
            </Button>
            <Button size="lg" variant="outline">
              Browse by City
            </Button>
          </div>
        </div>
      </section>

      {/* Trending This Week */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-3xl font-bold">Trending This Week</h2>
            </div>
            <Link href="/nearby" className="text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </section>

      {/* City Collections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">City Collections</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the best dishes from top food cities around the world
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topCities.map((city) => (
              <Link key={city.slug} href={`/city/${city.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold mb-1">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">{city.count} dishes</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* From TV Hitlists */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Utensils className="w-6 h-6 text-red-500" />
              <h2 className="text-3xl font-bold">From TV Hitlists</h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dishes featured on Diners, Drive-Ins and Dives and other food shows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingDishes.map((dish) => (
              <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={dish.photos[0]?.url || 'https://via.placeholder.com/400x300'} 
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-600">
                    From DDD
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{dish.restaurant.name}</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{dish.destinationWorthyScore}/100</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to discover amazing dishes?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food lovers finding the best dishes at every restaurant
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              Start Exploring
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
