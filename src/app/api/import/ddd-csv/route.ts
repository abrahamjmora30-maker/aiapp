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
        filename: 'ddd-csv-import',
        status: 'pending',
        message: `Importing ${rows.length} rows from DDD CSV`
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
              slug: row.restaurant.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              address: row.address || 'Unknown Address',
              city: row.city,
              state: row.state || 'Unknown',
              zipCode: row.zipCode || '00000',
              latitude: row.latitude ? parseFloat(row.latitude) : 0,
              longitude: row.longitude ? parseFloat(row.longitude) : 0
            }
          })
          createdRestaurants++
        }

        // Create venue source if it doesn't exist
        const existingSource = await db.venueSource.findFirst({
          where: {
            restaurantId: restaurant.id,
            sourceType: 'ddd'
          }
        })

        if (!existingSource) {
          await db.venueSource.create({
            data: {
              restaurantId: restaurant.id,
              sourceType: 'ddd',
              sourceName: 'User CSV Import'
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
          
          // Create dish
          const dish = await db.dish.create({
            data: {
              restaurantId: restaurant.id,
              name: row.dish,
              slug: row.dish.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              description: row.notes,
              tags: JSON.stringify([...tags, 'ddd'])
            }
          })
          createdDishes++

          // Create episode reference if show info is provided
          if (row.show || row.season || row.episode) {
            const venueSource = await db.venueSource.findFirst({
              where: {
                restaurantId: restaurant.id,
                sourceType: 'ddd'
              }
            })
            
            if (venueSource) {
              await db.episodeRef.create({
                data: {
                  venueSourceId: venueSource.id,
                  episodeNumber: row.episode,
                  seasonNumber: row.season,
                  description: row.notes
                }
              })
            }
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
        status: errors.length > 0 ? 'failed' : 'completed',
        message: `Processed ${rows.length} rows. Created ${createdRestaurants} restaurants and ${createdDishes} dishes. ${errors.length} errors.`
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
