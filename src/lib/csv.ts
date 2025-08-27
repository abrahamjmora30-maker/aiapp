import { z } from 'zod'

// CSV row schema for DDD imports
export const DDDCsvRowSchema = z.object({
  restaurant: z.string().min(1),
  city: z.string().min(1),
  region: z.string().optional(),
  country: z.string().optional(),
  dish: z.string().min(1),
  notes: z.string().optional(),
  show: z.string().optional(),
  season: z.string().optional(),
  episode: z.string().optional(),
  url: z.string().url().optional(),
})

export type DDDCsvRow = z.infer<typeof DDDCsvRowSchema>

// Parse CSV content
export function parseCSV(content: string): DDDCsvRow[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header and one data row')
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows: DDDCsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values = line.split(',').map(v => v.trim())
    const row: any = {}

    headers.forEach((header, index) => {
      if (values[index]) {
        row[header] = values[index]
      }
    })

    // Validate and parse the row
    try {
      const parsedRow = DDDCsvRowSchema.parse(row)
      rows.push(parsedRow)
    } catch (error) {
      console.warn(`Skipping invalid row ${i + 1}:`, error)
    }
  }

  return rows
}

// Normalize restaurant name
export function normalizeRestaurantName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

// Normalize dish name
export function normalizeDishName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

// Extract tags from dish name and notes
export function extractTags(dishName: string, notes?: string): string[] {
  const text = `${dishName} ${notes || ''}`.toLowerCase()
  const tags: string[] = []

  // Common food tags
  const commonTags = [
    'signature', 'spicy', 'vegan', 'vegetarian', 'gluten-free', 'bbq', 'smashburger',
    'taco', 'pizza', 'pasta', 'seafood', 'steak', 'burger', 'sandwich', 'salad',
    'dessert', 'breakfast', 'lunch', 'dinner', 'appetizer', 'main', 'side'
  ]

  commonTags.forEach(tag => {
    if (text.includes(tag)) {
      tags.push(tag)
    }
  })

  return tags
}
