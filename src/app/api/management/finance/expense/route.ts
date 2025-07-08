import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function POST(request: Request) {
  try {
    await requirePermission('manage_events')

    const { amount, category, description, eventId, notes, paymentMethod, relatedParty } =
      await request.json()

    if (!eventId || !description || !amount || !category) {
      return NextResponse.json(
        { message: 'Missing required fields: eventId, description, amount, category' },
        { status: 400 }
      )
    }

    const newExpense = await prisma.financialEntry.create({
      data: {
        amount: parseFloat(amount),
        category,
        currency: 'MXN',
        date: new Date(),

        description,

        eventId,

        notes: notes ?? null,

        paymentMethod: paymentMethod ?? null,

        relatedParty: relatedParty ?? null,

        source: 'Manual Entry',

        status: 'COMPLETED',
        type: 'EXPENSE',
      },
    })

    return NextResponse.json(newExpense)
  } catch (error) {
    console.error('Error creating expense entry:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error creating expense entry' }, { status: 500 })
  }
}
