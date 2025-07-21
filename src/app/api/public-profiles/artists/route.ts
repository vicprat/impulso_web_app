import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const artists = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        id: true,
        lastName: true,
        profile: {
          select: {
            avatarUrl: true,
            backgroundImageUrl: true,
            bio: true,
            occupation: true,
          },
        },
      },
      where: {
        UserRole: {
          some: {
            role: {
              name: 'artist',
            },
          },
        },
        isPublic: true,
      },
    })
    return NextResponse.json(artists)
  } catch (error) {
    console.error('[API/public-profiles/artists GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
