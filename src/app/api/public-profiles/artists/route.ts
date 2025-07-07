import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const artists = await prisma.user.findMany({
      where: {
        isPublic: true,
        UserRole: {
          some: {
            role: {
              name: 'artist',
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profile: {
          select: {
            avatarUrl: true,
            bio: true,
            occupation: true,
          },
        },
      },
    })

    return NextResponse.json(artists)
  } catch (error) {
    console.error('[API/public-profiles/artists GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
