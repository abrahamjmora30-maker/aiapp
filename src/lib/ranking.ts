import { db } from './db'

// Destination-Worthy Score calculation (0-100)
export async function calculateDestinationWorthyScore(dishId: string): Promise<number> {
  const dish = await db.dish.findUnique({
    where: { id: dishId },
    include: {
      votes: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 50 // Recent reviews
      },
      restaurant: {
        include: {
          checkins: {
            where: {
              dishId: dishId
            }
          }
        }
      }
    }
  })

  if (!dish) return 0

  let score = 0

  // 1. Community upvotes (log-scaled)
  const upvotes = dish.votes.length
  score += Math.log10(upvotes + 1) * 15 // Max ~30 points

  // 2. Recent review ratings (time-decayed)
  const now = new Date()
  const recentReviews = dish.reviews.filter(review => {
    const daysAgo = (now.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= 365 // Last year
  })

  if (recentReviews.length > 0) {
    const avgRating = recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
    const timeDecay = Math.exp(-recentReviews[0].createdAt.getTime() / (1000 * 60 * 60 * 24 * 365)) // 1 year half-life
    score += (avgRating - 1) * 10 * timeDecay // Max ~40 points
  }

  // 3. Check-ins (time-decayed)
  const checkins = dish.restaurant.checkins
  if (checkins.length > 0) {
    const recentCheckins = checkins.filter(checkin => {
      const daysAgo = (now.getTime() - checkin.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= 180 // Last 6 months
    })
    const timeDecay = Math.exp(-recentCheckins[0]?.createdAt.getTime() / (1000 * 60 * 60 * 24 * 180)) // 6 month half-life
    score += Math.log10(recentCheckins.length + 1) * 5 * timeDecay // Max ~15 points
  }

  // 4. Diversity bonus (if visitors from outside local city like it)
  // TODO: Implement when user location data is available
  // score += diversityBonus

  // 5. Source bonus if dish appears in DDD import
  const hasDDDSource = await db.venueSource.findFirst({
    where: {
      restaurantId: dish.restaurantId,
      kind: 'DDD'
    }
  })
  if (hasDDDSource) {
    score += 5 // Small bump for DDD dishes
  }

  // 6. Penalty for volatility (recent review variance)
  if (recentReviews.length >= 3) {
    const ratings = recentReviews.map(r => r.rating)
    const mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length
    const volatilityPenalty = Math.min(variance * 2, 10) // Max 10 point penalty
    score -= volatilityPenalty
  }

  return Math.max(0, Math.min(100, score))
}

// Trending Score calculation (exponential time decay)
export async function calculateTrendingScore(dishId: string): Promise<number> {
  const now = new Date()
  const halfLifeDays = 10 // 10 day half-life

  // Get recent activity
  const [recentVotes, recentCheckins, recentPhotos] = await Promise.all([
    db.vote.findMany({
      where: {
        dishId,
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    db.checkin.findMany({
      where: {
        dishId,
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    db.photo.findMany({
      where: {
        dishId,
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  let score = 0

  // Calculate time-decayed scores for each activity type
  const activities = [
    ...recentVotes.map(v => ({ type: 'vote', time: v.createdAt, weight: 1 })),
    ...recentCheckins.map(c => ({ type: 'checkin', time: c.createdAt, weight: 2 })),
    ...recentPhotos.map(p => ({ type: 'photo', time: p.createdAt, weight: 3 }))
  ]

  for (const activity of activities) {
    const daysAgo = (now.getTime() - activity.time.getTime()) / (1000 * 60 * 60 * 24)
    const decay = Math.exp(-daysAgo * Math.log(2) / halfLifeDays) // Exponential decay
    score += activity.weight * decay
  }

  return score
}

// Restaurant score cache calculation
export async function calculateRestaurantScoreCache(restaurantId: string): Promise<number> {
  const dishes = await db.dish.findMany({
    where: { restaurantId },
    select: { destinationWorthyScore: true }
  })

  if (dishes.length === 0) return 0

  // Average of top 3 dish scores
  const topScores = dishes
    .map(d => d.destinationWorthyScore)
    .sort((a, b) => b - a)
    .slice(0, 3)

  return topScores.reduce((sum, score) => sum + score, 0) / topScores.length
}

// Restaurant trending rank calculation
export async function calculateRestaurantTrendingRank(restaurantId: string): Promise<number | null> {
  const dishes = await db.dish.findMany({
    where: { restaurantId },
    select: { trendCache: true }
  })

  if (dishes.length === 0) return null

  // Sum of all dish trend scores
  const totalTrendScore = dishes.reduce((sum, dish) => sum + dish.trendCache, 0)

  // Get ranking among all restaurants
  const allRestaurants = await db.restaurant.findMany({
    select: { id: true, trendingRank: true }
  })

  const restaurantsWithTrendScores = await Promise.all(
    allRestaurants.map(async (restaurant) => {
      const restaurantDishes = await db.dish.findMany({
        where: { restaurantId: restaurant.id },
        select: { trendCache: true }
      })
      const score = restaurantDishes.reduce((sum, dish) => sum + dish.trendCache, 0)
      return { id: restaurant.id, score }
    })
  )

  restaurantsWithTrendScores.sort((a, b) => b.score - a.score)
  const rank = restaurantsWithTrendScores.findIndex(r => r.id === restaurantId) + 1

  return rank > 0 ? rank : null
}

// Recompute all caches (for cron job)
export async function recomputeAllCaches(): Promise<void> {
  console.log('Starting cache recomputation...')

  // Recompute dish scores
  const dishes = await db.dish.findMany({ select: { id: true } })
  for (const dish of dishes) {
    const [destinationScore, trendingScore] = await Promise.all([
      calculateDestinationWorthyScore(dish.id),
      calculateTrendingScore(dish.id)
    ])

    await db.dish.update({
      where: { id: dish.id },
      data: {
        destinationWorthyScore: destinationScore,
        trendCache: trendingScore
      }
    })
  }

  // Recompute restaurant scores
  const restaurants = await db.restaurant.findMany({ select: { id: true } })
  for (const restaurant of restaurants) {
    const [scoreCache, trendingRank] = await Promise.all([
      calculateRestaurantScoreCache(restaurant.id),
      calculateRestaurantTrendingRank(restaurant.id)
    ])

    await db.restaurant.update({
      where: { id: restaurant.id },
      data: {
        scoreCache,
        trendingRank
      }
    })
  }

  console.log('Cache recomputation completed')
}
