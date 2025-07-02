import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function GET() {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed pending income API:',
      session.user.email
    )

    const pendingIncomeEntries = await prisma.financialEntry.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        amount: true,
        currency: true,
        date: true,
        description: true,
        id: true,
        relatedParty: true,
        source: true,
        sourceId: true,
      },
      where: {
        eventId: null,
        status: 'PENDING',
        type: 'INCOME',
      },
    })

    return NextResponse.json(pendingIncomeEntries)
  } catch (error) {
    console.error('Error fetching pending income entries:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error fetching pending income entries' }, { status: 500 })
  }
}
