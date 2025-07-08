import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_EVENTS)

    const { eventId } = await params

    const financialEntries = await prisma.financialEntry.findMany({
      orderBy: {
        date: 'asc',
      },
      where: {
        eventId,
        status: 'COMPLETED',
      },
    })

    return NextResponse.json(financialEntries)
  } catch (error) {
    console.error('Error fetching financial entries for event:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error fetching financial entries' }, { status: 500 })
  }
}
