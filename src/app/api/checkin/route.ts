import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const CheckinRequestSchema = z.object({
  restaurantId: z.string().min(1),
  userId: z.string().min(1), // TODO: Get from auth session
  dishId: z.string().optional(),
  note: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, userId, dishId, note } = CheckinRequestSchema.parse(body)

    // Check if restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Check if dish exists if provided
    if (dishId) {
      const dish = await db.dish.findUnique({
        where: { id: dishId }
      })

      if (!dish) {
        return NextResponse.json(
          { error: 'Dish not found' },
          { status: 404 }
        )
      }
    }

    // Create checkin
    const checkin = await db.checkin.create({
      data: {
        userId,
        restaurantId,
        dishId,
        note
      },
      include: {
        restaurant: {
          select: {
            name: true,
            city: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      checkin: {
        id: checkin.id,
        restaurantId: checkin.restaurantId,
        dishId: checkin.dishId,
        note: checkin.note,
        createdAt: checkin.createdAt,
        restaurant: checkin.restaurant
      }
    })

  } catch (error) {
    console.error('Checkin error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkin' },
      { status: 500 }
    )
  }
}
