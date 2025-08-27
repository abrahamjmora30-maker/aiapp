import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const VoteRequestSchema = z.object({
  dishId: z.string().min(1),
  userId: z.string().min(1), // TODO: Get from auth session
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dishId, userId } = VoteRequestSchema.parse(body)

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

    // Check if user already voted
    const existingVote = await db.vote.findUnique({
      where: {
        userId_dishId: {
          userId,
          dishId
        }
      }
    })

    if (existingVote) {
      // Remove vote (toggle off)
      await db.vote.delete({
        where: {
          userId_dishId: {
            userId,
            dishId
          }
        }
      })

      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Vote removed'
      })
    } else {
      // Add vote
      await db.vote.create({
        data: {
          userId,
          dishId,
          value: 1
        }
      })

      return NextResponse.json({
        success: true,
        action: 'added',
        message: 'Vote added'
      })
    }

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
