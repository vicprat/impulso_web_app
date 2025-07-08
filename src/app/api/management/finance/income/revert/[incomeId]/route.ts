import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function PUT(request: Request, { params }: { params: { incomeId: string } }) {
  try {
    await requirePermission('manage_events')

    const { incomeId } = params

    const revertedEntry = await prisma.financialEntry.update({
      data: {
        eventId: null,
        status: 'PENDING',
      },
      where: {
        id: incomeId,
        status: 'COMPLETED',
        type: 'INCOME',
      },
    })

    return NextResponse.json(revertedEntry)
  } catch (error) {
    console.error('Error reverting income entry:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Income entry not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Error reverting income entry' }, { status: 500 })
  }
}
