import { NextResponse } from 'next/server'

import { getPublicProfileByUserId } from '@/modules/user/user.service'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const userProfile = await getPublicProfileByUserId(userId)

    if (!userProfile) {
      return NextResponse.json({ error: 'Public profile not found' }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('[API/public-profiles/userId GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
