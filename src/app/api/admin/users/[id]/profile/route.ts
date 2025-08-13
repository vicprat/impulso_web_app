import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requirePermission } from '@/modules/auth/server/server'
import { getUserById, updateUserAndRelatedData } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'

const UserUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const ProfileUpdateSchema = z.object({
  avatarUrl: z.string().nullish(),
  backgroundImageUrl: z.string().nullish(),
  bio: z.string().optional(),
  description: z.string().optional(),
  occupation: z.string().optional(),
})

const CombinedUpdateSchema = UserUpdateSchema.merge(ProfileUpdateSchema)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const userId = params.id

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Retornar solo los datos del perfil necesarios para el formulario
    const profileData = {
      avatarUrl: user.profile?.avatarUrl,
      backgroundImageUrl: user.profile?.backgroundImageUrl,
      bio: user.profile?.bio,
      description: user.profile?.description,
      firstName: user.firstName,
      lastName: user.lastName,
      occupation: user.profile?.occupation,
    }

    return NextResponse.json(profileData, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const userId = params.id

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
    console.error('Error updating user profile:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
