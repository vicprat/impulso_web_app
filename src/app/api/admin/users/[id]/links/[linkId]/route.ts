import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requirePermission } from '@/modules/auth/server/server'
import { deleteLink, updateLink } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'

const LinkUpdateSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL format'),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const { id, linkId } = await params
    const userId = id

    const json = await request.json()
    const validatedData = LinkUpdateSchema.parse(json)

    const updatedLink = await updateLink(linkId, userId, validatedData)

    return NextResponse.json(updatedLink, { status: 200 })
  } catch (error) {
    console.error('Error updating user link:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (error instanceof Error && error.message.includes('Link not found')) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const { id, linkId } = await params
    const userId = id

    await deleteLink(linkId, userId)

    return NextResponse.json({ message: 'Link deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user link:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (error instanceof Error && error.message.includes('Link not found')) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
