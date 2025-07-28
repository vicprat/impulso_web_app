import { NextResponse } from "next/server";

import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

import type { NextRequest } from "next/server";

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
      include: {
        movements: {
          orderBy: { date: 'desc' },
          select: {
            amount: true,
            date: true,
            id: true,
            status: true,
            type: true
          },
          take: 5,
          where: {
            userId
          } // Últimos 5 movimientos
        }
      },
      where: {
        movements: {
          some: {
            userId
          }
        }
      }
    })

    return NextResponse.json({
      bankAccounts: bankAccounts.map(account => ({
        bankName: account.bankName,
        currentBalance: Number(account.currentBalance),
        id: account.id,
        lastMovement: account.movements[0] ? {
          amount: Number(account.movements[0].amount),
          date: account.movements[0].date,
          id: account.movements[0].id,
          status: account.movements[0].status,
          type: account.movements[0].type
        } : null,
        movementsCount: account.movements.length,
        name: account.name
      })),
      user: {
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        lastName: user.lastName
      }
    })

  } catch (error) {
    console.error('Error fetching user bank accounts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 