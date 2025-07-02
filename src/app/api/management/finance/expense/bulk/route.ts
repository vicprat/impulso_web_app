import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function DELETE(request: Request) {
  try {
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed bulk expense delete API:',
      session.user.email
    )

    const { expenseIds } = await request.json()

    // Validar que se proporcionaron IDs
    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return NextResponse.json(
        { message: 'Se requiere un array de IDs de gastos para eliminar' },
        { status: 400 }
      )
    }

    // Verificar que todos los registros existen y son del tipo EXPENSE
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

    // IDs que realmente se pueden eliminar
    const validExpenseIds = existingExpenses.map((expense) => expense.id)
    const invalidIds = expenseIds.filter((id: string) => !validExpenseIds.includes(id))

    // Eliminar los gastos válidos
    const deleteResult = await prisma.financialEntry.deleteMany({
      where: {
        id: { in: validExpenseIds },
        type: 'EXPENSE',
      },
    })

    // Preparar respuesta con detalles
    const response = {
      deletedCount: deleteResult.count,
      deletedIds: validExpenseIds,
      message: 'Eliminación completada',
      skippedCount: invalidIds.length,
      skippedIds: invalidIds,
      totalRequested: expenseIds.length,
    }

    // Log para auditoría
    console.log(`Bulk delete completed:`, {
      deletedCount: deleteResult.count,
      deletedIds: validExpenseIds,
      skippedIds: invalidIds,
      userEmail: session.user.email,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in bulk expense deletion:', error)

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }

    // Error de parsing JSON
    if (error instanceof Error && error.message.includes('JSON')) {
      return NextResponse.json({ message: 'Formato de datos inválido' }, { status: 400 })
    }

    // Error de foreign key constraints
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
