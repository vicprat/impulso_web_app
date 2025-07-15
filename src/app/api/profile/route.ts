import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@/modules/auth/server/server'
import { getUserById, updateUserAndRelatedData } from '@/modules/user/user.service'

const UserUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const ProfileUpdateSchema = z.object({
  avatarUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  bio: z.string().optional(),
  description: z.string().optional(),
  occupation: z.string().optional(),
})

const CombinedUpdateSchema = UserUpdateSchema.merge(ProfileUpdateSchema)

export async function PUT(request: Request) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const json = await request.json()
    const validatedData = CombinedUpdateSchema.parse(json)

    const { firstName, lastName, ...profileData } = validatedData

    const updatedUser = await updateUserAndRelatedData(userId, {
      profile: profileData,
      user: {
        firstName,
        lastName,
      },
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Error updating profile:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const user = await getUserById(userId)
    const profile = user?.profile ?? null

    return NextResponse.json(profile, { status: 200 })
  } catch (error) {
    console.error('Error fetching profile:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
