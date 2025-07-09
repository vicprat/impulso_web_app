import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { getUserById, updateUserAndRelatedData } from '@/modules/user/user.service'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await Promise.resolve(params)
    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching public user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const targetUserId = params.id

    if (session.user.id !== targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const data = await request.json()

    const updatedUser = await updateUserAndRelatedData(targetUserId, data)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

