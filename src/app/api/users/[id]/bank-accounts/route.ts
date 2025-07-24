import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    
    const { id: userId } = await params

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener cuentas bancarias que tienen movimientos relacionados con este usuario
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        movements: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        movements: {
          where: {
            userId: userId
          },
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            date: true
          },
          orderBy: { date: 'desc' },
          take: 5 // Últimos 5 movimientos
        }
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      bankAccounts: bankAccounts.map(account => ({
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        currentBalance: Number(account.currentBalance),
        movementsCount: account.movements.length,
        lastMovement: account.movements[0] ? {
          id: account.movements[0].id,
          amount: Number(account.movements[0].amount),
          type: account.movements[0].type,
          status: account.movements[0].status,
          date: account.movements[0].date
        } : null
      }))
    })

  } catch (error) {
    console.error('Error fetching user bank accounts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 