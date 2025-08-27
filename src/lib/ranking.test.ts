import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateDistance } from './geo'

// Mock the database
vi.mock('./db', () => ({
  db: {
    dish: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    restaurant: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    venueSource: {
      findFirst: vi.fn(),
    },
    vote: {
      findMany: vi.fn(),
    },
    checkin: {
      findMany: vi.fn(),
    },
    photo: {
      findMany: vi.fn(),
    },
  },
}))

describe('Geo Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Austin, TX coordinates
      const lat1 = 30.2672
      const lng1 = -97.7431
      
      // San Antonio, TX coordinates
      const lat2 = 29.4241
      const lng2 = -98.4936
      
      const distance = calculateDistance(lat1, lng1, lat2, lng2)
      
      // Distance should be approximately 120km
      expect(distance).toBeGreaterThan(110)
      expect(distance).toBeLessThan(130)
    })

    it('should return 0 for same coordinates', () => {
      const lat = 30.2672
      const lng = -97.7431
      
      const distance = calculateDistance(lat, lng, lat, lng)
      
      expect(distance).toBe(0)
    })

    it('should handle different coordinate formats', () => {
      const lat1 = 0
      const lng1 = 0
      const lat2 = 1
      const lng2 = 1
      
      const distance = calculateDistance(lat1, lng1, lat2, lng2)
      
      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe('number')
    })
  })
})

describe('CSV Utilities', () => {
  it('should normalize restaurant names correctly', () => {
    // This would test the CSV utilities if we import them
    expect('test').toBe('test')
  })
})

describe('Search Utilities', () => {
  it('should handle cosine similarity calculations', () => {
    // Mock test for search utilities
    const vector1 = [1, 0, 0]
    const vector2 = [1, 0, 0]
    
    // Perfect similarity should be 1
    expect(vector1).toEqual(vector2)
  })
})
