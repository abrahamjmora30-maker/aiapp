import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { semanticSearch, textSearch } from '@/lib/search'

const SearchRequestSchema = z.object({
  q: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().min(0.1).max(100).optional(),
  tags: z.array(z.string()).optional(),
  priceLevel: z.number().min(1).max(4).optional(),
  limit: z.number().min(1).max(50).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { q, lat, lng, radiusKm, tags, priceLevel, limit = 20 } = SearchRequestSchema.parse(body)

    // Build search filters
    const filters = {
      tags,
      priceLevel,
      radiusKm,
      lat,
      lng
    }

    // Try semantic search first, fallback to text search
    let results
    try {
      results = await semanticSearch(q, filters, limit)
    } catch (error) {
      console.warn('Semantic search failed, falling back to text search:', error)
      results = await textSearch(q, filters, limit)
    }

    // Format results for response
    const formattedResults = results.map(result => ({
      dish: {
        id: result.dish.id,
        name: result.dish.name,
        description: result.dish.description,
        tags: result.dish.tags,
        mustOrder: result.dish.mustOrder,
        destinationWorthyScore: result.dish.destinationWorthyScore,
        trendCache: result.dish.trendCache,
        photos: result.dish.photos,
        reviews: result.dish.reviews,
        votes: result.dish.votes,
      },
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        city: result.restaurant.city,
        region: result.restaurant.region,
        priceLevel: result.restaurant.priceLevel,
        lat: result.restaurant.lat,
        lng: result.restaurant.lng,
      },
      similarity: result.similarity,
      distance: result.distance
    }))

    return NextResponse.json({
      success: true,
      results: formattedResults,
      total: formattedResults.length,
      query: q,
      filters
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
