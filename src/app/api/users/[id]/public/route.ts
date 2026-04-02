import { NextResponse } from 'next/server'

import { updateUserPublicStatus } from '@/modules/user/user.service'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { isPublic } = (await request.json()) as { isPublic: boolean }

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic status is required and must be a boolean' },
        { status: 400 }
      )
    }

    const updatedUser = await updateUserPublicStatus(id, isPublic)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[API/users/id/public PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
