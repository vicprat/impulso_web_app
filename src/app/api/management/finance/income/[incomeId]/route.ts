import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function PUT(request: Request, { params }: { params: { incomeId: string } }) {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed income update API:',
      session.user.email
    )

    const { incomeId } = params
    const { amount, category, description, notes, paymentMethod, relatedParty } =
      await request.json()

    if (!description || !amount || !category) {
      return NextResponse.json(
        { message: 'Missing required fields: description, amount, category' },
        { status: 400 }
      )
    }

    const updatedIncome = await prisma.financialEntry.update({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        notes: notes || null,
        paymentMethod: paymentMethod || null,
        relatedParty: relatedParty || null,
      },
      where: {
        id: incomeId,
        type: 'INCOME',
      },
    })

    return NextResponse.json(updatedIncome)
  } catch (error) {
    console.error('Error updating income entry:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Income not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Error updating income entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { incomeId: string } }) {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed income delete API:',
      session.user.email
    )

    const { incomeId } = params

    const existingIncome = await prisma.financialEntry.findFirst({
      where: {
        id: incomeId,
        type: 'INCOME',
      },
    })

    if (!existingIncome) {
      return NextResponse.json(
        { message: 'Income not found or is not an income type' },
        { status: 404 }
      )
    }

    await prisma.financialEntry.delete({
      where: {
        id: incomeId,
      },
    })

    return NextResponse.json({
      deletedId: incomeId,
      message: 'Income deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting income entry:', error)

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }

    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Income not found' }, { status: 404 })
    }

    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { message: 'Cannot delete income due to related records' },
        { status: 409 }
      )
    }

    return NextResponse.json({ message: 'Error deleting income entry' }, { status: 500 })
  }
}
