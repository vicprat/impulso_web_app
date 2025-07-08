import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function DELETE(request: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_EVENTS)

    const { expenseIds } = await request.json()

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return NextResponse.json(
        { message: 'Se requiere un array de IDs de gastos para eliminar' },
        { status: 400 }
      )
    }

    const existingExpenses = await prisma.financialEntry.findMany({
      select: {
        description: true,
        id: true,
      },
      where: {
        id: { in: expenseIds },
        type: 'EXPENSE',
      },
    })

    if (existingExpenses.length === 0) {
      return NextResponse.json(
        { message: 'No se encontraron gastos válidos para eliminar' },
        { status: 404 }
      )
    }

    const validExpenseIds = existingExpenses.map((expense) => expense.id)
    const invalidIds = expenseIds.filter((id: string) => !validExpenseIds.includes(id))

    const deleteResult = await prisma.financialEntry.deleteMany({
      where: {
        id: { in: validExpenseIds },
        type: 'EXPENSE',
      },
    })

    const response = {
      deletedCount: deleteResult.count,
      deletedIds: validExpenseIds,
      message: 'Eliminación completada',
      skippedCount: invalidIds.length,
      skippedIds: invalidIds,
      totalRequested: expenseIds.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in bulk expense deletion:', error)

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }

    if (error instanceof Error && error.message.includes('JSON')) {
      return NextResponse.json({ message: 'Formato de datos inválido' }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { message: 'No se pueden eliminar algunos gastos debido a registros relacionados' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Error interno del servidor al eliminar gastos' },
      { status: 500 }
    )
  }
}
