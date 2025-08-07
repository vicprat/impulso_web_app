import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requirePermission } from '@/modules/auth/server/server'
import { createLink, getLinksByUserId } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'

const LinkCreateSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL format'),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const { id } = await params
    const userId = id

    const links = await getLinksByUserId(userId)

    return NextResponse.json(links, { status: 200 })
  } catch (error) {
    console.error('Error fetching user links:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const { id } = await params
    const userId = id

    const json = await request.json()
    const validatedData = LinkCreateSchema.parse(json)

    const newLink = await createLink(userId, validatedData)

    return NextResponse.json(newLink, { status: 201 })
  } catch (error) {
    console.error('Error creating user link:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
