import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const ReviewRequestSchema = z.object({
  dishId: z.string().min(1),
  userId: z.string().min(1), // TODO: Get from auth session
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(1000),
  tags: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dishId, userId, rating, text, tags = [] } = ReviewRequestSchema.parse(body)

    // Check if dish exists
    const dish = await db.dish.findUnique({
      where: { id: dishId }
    })

    if (!dish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      )
    }

    // Create review
    const review = await db.review.create({
      data: {
        userId,
        dishId,
        rating,
        text,
        tags
      },
      include: {
        user: {
          select: {
            name: true,
            handle: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        text: review.text,
        tags: review.tags,
        createdAt: review.createdAt,
        user: review.user
      }
    })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
