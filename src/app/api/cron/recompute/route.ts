import { NextRequest, NextResponse } from 'next/server'
import { recomputeAllCaches } from '@/lib/ranking'

export async function POST(request: NextRequest) {
  try {
    // Check for CRON_SECRET
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }

    // Verify secret from query params or headers
    const url = new URL(request.url)
    const secretFromQuery = url.searchParams.get('secret')
    const secretFromHeader = request.headers.get('x-cron-secret')

    if (secretFromQuery !== cronSecret && secretFromHeader !== cronSecret) {
      return NextResponse.json(
        { error: 'Invalid CRON_SECRET' },
        { status: 401 }
      )
    }

    // Recompute all caches
    await recomputeAllCaches()

    return NextResponse.json({
      success: true,
      message: 'Cache recomputation completed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron recompute error:', error)
    return NextResponse.json(
      { error: 'Cache recomputation failed' },
      { status: 500 }
    )
  }
}
