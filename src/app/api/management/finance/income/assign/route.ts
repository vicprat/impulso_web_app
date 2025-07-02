import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function POST(request: Request) {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed income assignment API:',
      session.user.email
    )

    const { eventId, incomeEntryId } = await request.json()

    if (!incomeEntryId || !eventId) {
      return NextResponse.json({ message: 'Missing incomeEntryId or eventId' }, { status: 400 })
    }

    const updatedEntry = await prisma.financialEntry.update({
      data: {
        eventId,
        status: 'COMPLETED',
      },
      where: {
        eventId: null,
        id: incomeEntryId,
        status: 'PENDING',
        type: 'INCOME', // Ensure it's still unassigned and pending
      },
    })

    if (!updatedEntry) {
      return NextResponse.json(
        { message: 'Financial entry not found or not eligible for assignment' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error assigning income entry:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error assigning income entry' }, { status: 500 })
  }
}
