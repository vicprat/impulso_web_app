import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'
import { api as customerApi } from '@/src/modules/customer/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    
    const {id: userId} = await params
   const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener movimientos financieros relacionados con el usuario
    const financialEntries = await prisma.financialEntry.findMany({
      where: {
        userId: userId
      },
      orderBy: { date: 'desc' },
      include: {
        bankAccount: true
      }
    })

    // Calcular métricas financieras
    const totalMovements = financialEntries.length
    const lastMovement = financialEntries[0] || null

    // Calcular total por pagar (movimientos pendientes)
    const pendingAmount = financialEntries
      .filter(entry => entry.status === 'PENDING')
      .reduce((sum, entry) => {
        const amount = Number(entry.amount)
        const amountPaid = Number(entry.amountPaid || 0)
        const pendingValue = amount - amountPaid // Lo que falta por pagar
        
        // Para proveedores, empleados y socios: sumar montos positivos (pagos a realizar)
        if (['provider', 'employee', 'partner'].includes(role || '')) {
          return sum + (amount > 0 ? pendingValue : 0)
        }
        // Para artistas: sumar montos negativos (pagos a recibir)
        if (role === 'artist') {
          return sum + (amount < 0 ? Math.abs(pendingValue) : 0)
        }
        return sum
      }, 0)

    // Calcular total de ingresos/egresos según el rol
    // Para ingresos: usar amountPaid si está disponible, sino amount
    const totalIncome = financialEntries
      .filter(entry => Number(entry.amount) > 0)
      .reduce((sum, entry) => {
        const amountPaid = Number(entry.amountPaid || 0)
        const amount = Number(entry.amount)
        // Si hay amountPaid, usar ese valor (lo que realmente se ha pagado)
        // Si no hay amountPaid, usar el amount total
        return sum + (amountPaid > 0 ? amountPaid : amount)
      }, 0)

    // Para gastos: usar amountPaid si está disponible, sino amount
    const totalExpenses = financialEntries
      .filter(entry => Number(entry.amount) < 0)
      .reduce((sum, entry) => {
        const amountPaid = Number(entry.amountPaid || 0)
        const amount = Math.abs(Number(entry.amount))
        // Si hay amountPaid, usar ese valor (lo que realmente se ha pagado)
        // Si no hay amountPaid, usar el amount total
        return sum + (amountPaid > 0 ? amountPaid : amount)
      }, 0)

    // Calcular totales pagados (lo que realmente se ha pagado)
    const totalIncomePaid = financialEntries
      .filter(entry => Number(entry.amount) > 0)
      .reduce((sum, entry) => sum + Number(entry.amountPaid || 0), 0)

    const totalExpensesPaid = financialEntries
      .filter(entry => Number(entry.amount) < 0)
      .reduce((sum, entry) => sum + Number(entry.amountPaid || 0), 0)

    // Para artistas, obtener información adicional de vendor
    let artistInfo = null
    if (role === 'artist') {
      artistInfo = await prisma.artist.findFirst({
        where: { user: { id: userId } },
        include: {
          user: true
        }
      })
    }

    // Para clientes, obtener información de pedidos de Shopify
    let customerInfo = null
    if (['customer', 'vip_customer'].includes(role || '')) {
      try {
        // Usar el método getAllOrders con filtro por email del usuario
        const shopifyOrders = await customerApi.getAllOrders({
          first: 50, // Obtener más órdenes para tener una mejor muestra
          query: `email:${user.email}` // Filtrar por email del usuario
        })

        const userOrders = shopifyOrders.orders?.edges || []
        
        // Calcular métricas de Shopify
        const orderCount = userOrders.length
        const totalSpent = userOrders.reduce((sum, edge) => {
          const amount = parseFloat(
            edge.node.currentTotalPriceSet?.shopMoney?.amount || 
            edge.node.totalPriceSet?.shopMoney?.amount || 
            '0'
          )
          return sum + amount
        }, 0)

        // Obtener las últimas órdenes para mostrar
        const recentOrders = userOrders
          .slice(0, 5) // Solo las últimas 5
          .map(edge => ({
            id: edge.node.id,
            totalPrice: parseFloat(
              edge.node.currentTotalPriceSet?.shopMoney?.amount || 
              edge.node.totalPriceSet?.shopMoney?.amount || 
              '0'
            ),
            createdAt: edge.node.createdAt,
            status: edge.node.displayFinancialStatus || 'UNKNOWN'
          }))

        customerInfo = {
          id: user.id,
          orderCount,
          totalSpent,
          orders: recentOrders
        }
      } catch (error) {
        console.error('Error fetching Shopify orders for customer:', error)
        // Si falla, usar datos por defecto
        customerInfo = {
          id: user.id,
          orderCount: 0,
          totalSpent: 0,
          orders: []
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.UserRole.map(ur => ur.role.name)
      },
      financialMetrics: {
        totalMovements,
        pendingAmount,
        totalIncome,
        totalExpenses,
        totalIncomePaid,
        totalExpensesPaid,
        lastMovement: lastMovement ? {
          id: lastMovement.id,
          amount: Number(lastMovement.amount),
          description: lastMovement.description,
          date: lastMovement.date,
          status: lastMovement.status,
          category: lastMovement.category
        } : null
      },
      artistInfo,
      customerInfo
    })

  } catch (error) {
    console.error('Error fetching user finance data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 