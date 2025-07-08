import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_EVENTS)

    const { eventId } = await params

    const event = await prisma.event.findUnique({
      select: {
        id: true,
        name: true,
        shopifyProductId: true,
      },
      where: {
        id: eventId,
      },
    })

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching financial event details:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error fetching event details' }, { status: 500 })
  }
}
