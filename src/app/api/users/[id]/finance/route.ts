import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'
import { api as customerApi } from '@/src/modules/customer/api'

import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const user = await prisma.user.findUnique({
      include: {
        UserRole: {
          include: {
            role: true,
          },
        },
      },
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const financialEntries = await prisma.financialEntry.findMany({
      include: {
        bankAccount: true,
      },
      orderBy: { date: 'desc' },
      where: {
        userId,
      },
    })

    const totalMovements = financialEntries.length
    const lastMovement = financialEntries[0] || null

    const pendingAmount = financialEntries
      .filter((entry) => entry.status === 'PENDING')
      .reduce((sum, entry) => {
        const amount = Number(entry.amount)
        const amountPaid = Number(entry.amountPaid || 0)
        const pendingValue = amount - amountPaid

        if (['provider', 'employee', 'partner'].includes(role || '')) {
          return sum + (amount > 0 ? pendingValue : 0)
        }

        if (role === 'artist') {
          return sum + (amount < 0 ? Math.abs(pendingValue) : 0)
        }
        return sum
      }, 0)

    const totalIncome = financialEntries
      .filter((entry) => Number(entry.amount) > 0)
      .reduce((sum, entry) => {
        const amountPaid = Number(entry.amountPaid || 0)
        const amount = Number(entry.amount)

        return sum + (amountPaid > 0 ? amountPaid : amount)
      }, 0)

    const totalExpenses = financialEntries
      .filter((entry) => Number(entry.amount) < 0)
      .reduce((sum, entry) => {
        const amountPaid = Number(entry.amountPaid || 0)
        const amount = Math.abs(Number(entry.amount))

        return sum + (amountPaid > 0 ? amountPaid : amount)
      }, 0)

    const totalIncomePaid = financialEntries
      .filter((entry) => Number(entry.amount) > 0)
      .reduce((sum, entry) => sum + Number(entry.amountPaid || 0), 0)

    const totalExpensesPaid = financialEntries
      .filter((entry) => Number(entry.amount) < 0)
      .reduce((sum, entry) => sum + Number(entry.amountPaid || 0), 0)

    let artistInfo = null
    if (role === 'artist') {
      artistInfo = await prisma.artist.findFirst({
        include: {
          user: true,
        },
        where: { user: { id: userId } },
      })
    }

    let customerInfo = null
    if (['customer', 'vip_customer'].includes(role || '')) {
      try {
        const shopifyOrders = await customerApi.getAllOrders({
          first: 50,
          query: `email:${user.email}`,
        })

        const userOrders = shopifyOrders.orders?.edges || []

        const orderCount = userOrders.length
        const totalSpent = userOrders.reduce((sum, edge) => {
          const amount = parseFloat(
            edge.node.currentTotalPriceSet?.shopMoney?.amount ||
              edge.node.totalPriceSet?.shopMoney?.amount ||
              '0'
          )
          return sum + amount
        }, 0)

        const recentOrders = userOrders.slice(0, 5).map((edge) => ({
          createdAt: edge.node.createdAt,
          id: edge.node.id,
          status: edge.node.displayFinancialStatus || 'UNKNOWN',
          totalPrice: parseFloat(
            edge.node.currentTotalPriceSet?.shopMoney?.amount ||
              edge.node.totalPriceSet?.shopMoney?.amount ||
              '0'
          ),
        }))

        customerInfo = {
          id: user.id,
          orderCount,
          orders: recentOrders,
          totalSpent,
        }
      } catch (error) {
        console.error('Error fetching Shopify orders for customer:', error)

        customerInfo = {
          id: user.id,
          orderCount: 0,
          orders: [],
          totalSpent: 0,
        }
      }
    }

    return NextResponse.json({
      artistInfo,
      customerInfo,
      financialMetrics: {
        lastMovement: lastMovement
          ? {
              amount: Number(lastMovement.amount),
              category: lastMovement.category,
              date: lastMovement.date,
              description: lastMovement.description,
              id: lastMovement.id,
              status: lastMovement.status,
            }
          : null,
        pendingAmount,
        totalExpenses,
        totalExpensesPaid,
        totalIncome,
        totalIncomePaid,
        totalMovements,
      },
      user: {
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        lastName: user.lastName,
        roles: user.UserRole.map((ur) => ur.role.name),
      },
    })
  } catch (error) {
    console.error('Error fetching user finance data:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
