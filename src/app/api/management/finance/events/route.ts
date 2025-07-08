import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function GET() {
  try {
    await requirePermission('manage_events')

    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        shopifyProductId: true,
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events for financial management:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error fetching events' }, { status: 500 })
  }
}
