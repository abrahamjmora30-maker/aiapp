import { db } from './db'
import { createEmbedding, cosineSimilarity } from './embeddings'
import { calculateDistance } from './geo'

export interface SearchFilters {
  tags?: string[]
  priceLevel?: number
  radiusKm?: number
  lat?: number
  lng?: number
}

export interface SearchResult {
  dish: any
  restaurant: any
  similarity: number
  distance?: number
}

export async function semanticSearch(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult[]> {
  try {
    // Create embedding for the search query
    const queryEmbedding = await createEmbedding(query.toLowerCase())
    
    // Get all dishes with embeddings
    const dishes = await db.dish.findMany({
      where: {
        embedding: {
          not: null
        },
        ...(filters.tags && filters.tags.length > 0 ? {
          tags: {
            hasSome: filters.tags
          }
        } : {}),
        restaurant: {
          ...(filters.priceLevel ? {
            priceLevel: filters.priceLevel
          } : {})
        }
      },
      include: {
        restaurant: true,
        votes: true,
        reviews: true
      }
    })
    
    // Calculate similarity scores
    const results: SearchResult[] = []
    
    for (const dish of dishes) {
      if (!dish.embedding || dish.embedding.length === 0) continue
      
      const similarity = cosineSimilarity(queryEmbedding, dish.embedding)
      
      let distance: number | undefined
      if (filters.lat && filters.lng && dish.restaurant.lat && dish.restaurant.lng) {
        distance = calculateDistance(
          filters.lat,
          filters.lng,
          dish.restaurant.lat,
          dish.restaurant.lng
        )
        
        // Filter by radius if specified
        if (filters.radiusKm && distance > filters.radiusKm) {
          continue
        }
      }
      
      results.push({
        dish,
        restaurant: dish.restaurant,
        similarity,
        distance
      })
    }
    
    // Sort by similarity (descending) and distance (ascending if available)
    results.sort((a, b) => {
      // Primary sort by similarity
      if (Math.abs(a.similarity - b.similarity) > 0.01) {
        return b.similarity - a.similarity
      }
      
      // Secondary sort by distance if available
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      
      return 0
    })
    
    return results.slice(0, limit)
  } catch (error) {
    console.error('Error in semantic search:', error)
    throw new Error('Search failed')
  }
}

// Simple text search fallback
export async function textSearch(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<SearchResult[]> {
  const dishes = await db.dish.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query.toLowerCase()] } }
      ],
      ...(filters.tags && filters.tags.length > 0 ? {
        tags: {
          hasSome: filters.tags
        }
      } : {}),
      restaurant: {
        ...(filters.priceLevel ? {
          priceLevel: filters.priceLevel
        } : {})
      }
    },
    include: {
      restaurant: true,
      votes: true,
      reviews: true
    },
    take: limit
  })
  
  return dishes.map(dish => ({
    dish,
    restaurant: dish.restaurant,
    similarity: 1.0, // Placeholder for text search
    distance: filters.lat && filters.lng && dish.restaurant.lat && dish.restaurant.lng
      ? calculateDistance(filters.lat, filters.lng, dish.restaurant.lat, dish.restaurant.lng)
      : undefined
  }))
}
