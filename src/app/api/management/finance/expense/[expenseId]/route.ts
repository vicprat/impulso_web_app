import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function PUT(request: Request, { params }: { params: { expenseId: string } }) {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed expense update API:',
      session.user.email
    )

    const { expenseId } = params
    const { amount, category, description, notes, paymentMethod, relatedParty } =
      await request.json()

    if (!description || !amount || !category) {
      return NextResponse.json(
        { message: 'Missing required fields: description, amount, category' },
        { status: 400 }
      )
    }

    const updatedExpense = await prisma.financialEntry.update({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        notes: notes || null,
        paymentMethod: paymentMethod || null,
        relatedParty: relatedParty || null,
      },
      where: {
        id: expenseId,
        type: 'EXPENSE',
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error updating expense entry:', error)
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Error updating expense entry' }, { status: 500 })
  }
}

// DELETE - Eliminar gasto
export async function DELETE(request: Request, { params }: { params: { expenseId: string } }) {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed expense delete API:',
      session.user.email
    )

    const { expenseId } = params

    // Verificar que el gasto existe y es del tipo EXPENSE
    const existingExpense = await prisma.financialEntry.findFirst({
      where: {
        id: expenseId,
        type: 'EXPENSE',
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { message: 'Expense not found or is not an expense type' },
        { status: 404 }
      )
    }

    // Eliminar el gasto
    await prisma.financialEntry.delete({
      where: {
        id: expenseId,
      },
    })

    return NextResponse.json({
      deletedId: expenseId,
      message: 'Expense deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting expense entry:', error)

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }

    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 })
    }

    // Error de foreign key constraints (si existe)
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { message: 'Cannot delete expense due to related records' },
        { status: 409 }
      )
    }

    return NextResponse.json({ message: 'Error deleting expense entry' }, { status: 500 })
  }
}
