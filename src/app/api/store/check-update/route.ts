import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { lastUpdate } = await request.json()

    if (!lastUpdate) {
      return NextResponse.json({ error: 'lastUpdate is required' }, { status: 400 })
    }

    return NextResponse.json({
      hasUpdates: false,
      lastUpdate: Date.now(),
      message: 'Store update check completed',
    })
  } catch (error) {
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}