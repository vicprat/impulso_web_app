import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@/modules/auth/server/server'
import { deleteLink, updateLink } from '@/modules/user/user.service'

const LinkUpdateSchema = z.object({
  isPrimary: z.boolean().optional(),
  order: z.number().int().optional(),
  platform: z.string().min(1).optional(),
  url: z.string().url().optional(),
})

interface RouteParams {
  params: { linkId: string }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { linkId } = params

    const json = await request.json()
    const validatedData = LinkUpdateSchema.parse(json)

    const updatedLink = await updateLink(linkId, userId, validatedData)

    return NextResponse.json(updatedLink, { status: 200 })
  } catch (error) {
    console.error('Error updating link:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Link not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { linkId } = params

    await deleteLink(linkId, userId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting link:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Link not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
