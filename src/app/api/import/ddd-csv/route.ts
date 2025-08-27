import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseCSV, normalizeRestaurantName, normalizeDishName, extractTags } from '@/lib/csv'
import { createDishEmbedding } from '@/lib/embeddings'

const ImportRequestSchema = z.object({
  csvContent: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csvContent } = ImportRequestSchema.parse(body)

    // Parse CSV content
    const rows = parseCSV(csvContent)
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows found in CSV' },
        { status: 400 }
      )
    }

    // Create import job
    const importJob = await db.importJob.create({
      data: {
        status: 'queued',
        source: 'USER_CSV',
        note: `Importing ${rows.length} rows from DDD CSV`
      }
    })

    let createdRestaurants = 0
    let createdDishes = 0
    let errors: string[] = []

    // Process each row
    for (const row of rows) {
      try {
        // Find or create restaurant
        const normalizedRestaurantName = normalizeRestaurantName(row.restaurant)
        let restaurant = await db.restaurant.findFirst({
          where: {
            name: { equals: normalizedRestaurantName, mode: 'insensitive' },
            city: { equals: row.city, mode: 'insensitive' }
          }
        })

        if (!restaurant) {
          restaurant = await db.restaurant.create({
            data: {
              name: row.restaurant,
              city: row.city,
              region: row.region,
              country: row.country || 'USA',
              tags: ['ddd-import']
            }
          })
          createdRestaurants++
        }

        // Create venue source if it doesn't exist
        const existingSource = await db.venueSource.findFirst({
          where: {
            restaurantId: restaurant.id,
            kind: 'DDD'
          }
        })

        if (!existingSource) {
          await db.venueSource.create({
            data: {
              restaurantId: restaurant.id,
              kind: 'DDD',
              label: 'User CSV Import',
              url: row.url
            }
          })
        }

        // Create dish
        const normalizedDishName = normalizeDishName(row.dish)
        const existingDish = await db.dish.findFirst({
          where: {
            name: { equals: normalizedDishName, mode: 'insensitive' },
            restaurantId: restaurant.id
          }
        })

        if (!existingDish) {
          const tags = extractTags(row.dish, row.notes)
          
          // Create dish with embedding
          const dish = await db.dish.create({
            data: {
              restaurantId: restaurant.id,
              name: row.dish,
              description: row.notes,
              tags: [...tags, 'ddd'],
              mustOrder: true, // DDD dishes are typically must-order
              embedding: await createDishEmbedding(row.dish, tags)
            }
          })
          createdDishes++

          // Create episode reference if show info is provided
          if (row.show || row.season || row.episode) {
            await db.episodeRef.create({
              data: {
                restaurantId: restaurant.id,
                dishId: dish.id,
                show: row.show || 'DDD',
                season: row.season ? parseInt(row.season) : null,
                episode: row.episode ? parseInt(row.episode) : null,
                note: row.notes
              }
            })
          }
        }
      } catch (error) {
        console.error('Error processing row:', row, error)
        errors.push(`Row "${row.restaurant} - ${row.dish}": ${error}`)
      }
    }

    // Update import job status
    await db.importJob.update({
      where: { id: importJob.id },
      data: {
        status: errors.length > 0 ? 'failed' : 'done',
        summary: {
          totalRows: rows.length,
          createdRestaurants,
          createdDishes,
          errors: errors.slice(0, 10) // Limit error messages
        }
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        createdRestaurants,
        createdDishes,
        errors: errors.length
      },
      importJobId: importJob.id
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    )
  }
}
