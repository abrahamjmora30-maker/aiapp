import { db } from './db'

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

// Get nearby restaurants within radius
export async function getNearbyRestaurants(
  lat: number,
  lng: number,
  radiusKm: number = 10,
  limit: number = 50
) {
  // Note: This is a simplified implementation
  // For production, consider using PostGIS or a geospatial database
  const restaurants = await db.restaurant.findMany({
    where: {
      lat: { not: null },
      lng: { not: null }
    },
    include: {
      dishes: {
        include: {
          votes: true,
          reviews: true
        }
      },
      photos: true
    },
    take: limit
  })

  return restaurants
    .map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(lat, lng, restaurant.lat!, restaurant.lng!)
    }))
    .filter(restaurant => restaurant.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

// Get user's current location
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    })
  })
}
