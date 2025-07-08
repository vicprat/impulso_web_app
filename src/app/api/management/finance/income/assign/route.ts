import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function POST(request: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_EVENTS)

    const { eventId, incomeEntryId } = await request.json()

    if (!incomeEntryId || !eventId) {
      return NextResponse.json({ message: 'Missing incomeEntryId or eventId' }, { status: 400 })
    }

    try {
      const updatedEntry = await prisma.financialEntry.update({
        data: {
          eventId,
          status: 'COMPLETED',
        },
        where: {
          eventId: null,
          id: incomeEntryId,
          status: 'PENDING',
          type: 'INCOME',
        },
      })

      return NextResponse.json(updatedEntry)
    } catch {
      return NextResponse.json(
        { message: 'Financial entry not found or not eligible for assignment' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error assigning income entry:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error assigning income entry' }, { status: 500 })
  }
}
