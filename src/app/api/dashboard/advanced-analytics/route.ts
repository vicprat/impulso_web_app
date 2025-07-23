import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { requirePermission } from '@/src/modules/auth/server/server'

interface ShopifyMoneyV2 {
  amount: string
  currencyCode: string
}

interface ShopifyLineItemNode {
  id: string
  title: string
  quantity: number
  originalUnitPriceSet: {
    shopMoney: ShopifyMoneyV2
  }
}

interface ShopifyLineItemEdge {
  node: ShopifyLineItemNode
}

interface ShopifyOrderNode {
  id: string
  createdAt: string
  displayFinancialStatus: string
  currentTotalPriceSet: {
    shopMoney: ShopifyMoneyV2
  }
  lineItems: {
    edges: ShopifyLineItemEdge[]
  }
}

interface ShopifyOrderEdge {
  node: ShopifyOrderNode
}

interface ShopifyOrdersResponse {
  orders: {
    edges: ShopifyOrderEdge[]
  }
}

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.VIEW_ANALYTICS)

    const ordersQuery = `
      query {
        orders(first: 250) {
          edges {
            node {
              id
              createdAt
              currentTotalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
    `

    const response: ShopifyOrdersResponse = await makeAdminApiRequest(ordersQuery)
    const orders: ShopifyOrderEdge[] = response.orders.edges
    const currentDate = new Date()

    // Análisis temporal
    const last30Days = orders.filter((order: ShopifyOrderEdge) => {
      const orderDate = new Date(order.node.createdAt)
      const daysDiff = (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
      return daysDiff <= 30
    })

    const last7Days = orders.filter((order: ShopifyOrderEdge) => {
      const orderDate = new Date(order.node.createdAt)
      const daysDiff = (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
      return daysDiff <= 7
    })

    // Métricas de crecimiento
    const revenueThisMonth = last30Days.reduce(
      (sum: number, order: ShopifyOrderEdge) =>
        sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
      0
    )

    const revenueThisWeek = last7Days.reduce(
      (sum: number, order: ShopifyOrderEdge) =>
        sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
      0
    )

    // Análisis por hora del día
    const ordersByHour = Array.from({ length: 24 }, (_, hour) => {
      const hourlyOrders = orders.filter((order: ShopifyOrderEdge) => {
        const orderDate = new Date(order.node.createdAt)
        return orderDate.getHours() === hour
      })
      return {
        hour,
        orders: hourlyOrders.length,
        revenue: hourlyOrders.reduce(
          (sum: number, order: ShopifyOrderEdge) =>
            sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
          0
        ),
      }
    })

    const data = {
      customerInsights: {
        averageOrdersPerCustomer: 0,
        customerLifetimeValue: 0,
        // Necesitarías analizar customer.id repetidos
        newCustomers: 0,
        returningCustomers: 0,
      },
      orderAnalytics: {
        averageOrderValue:
          orders.length > 0
            ? orders.reduce(
                (sum: number, order: ShopifyOrderEdge) =>
                  sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
                0
              ) / orders.length
            : 0,
        ordersByHour,
        ordersThisMonth: last30Days.length,
        ordersThisWeek: last7Days.length,
        peakHour: ordersByHour.reduce(
          (max, current) => (current.orders > max.orders ? current : max),
          ordersByHour[0]
        ),
        totalOrders: orders.length,
      },
      revenueGrowth: {
        // Calcular vs semana anterior si tienes datos
        monthlyGrowth: 0,
        thisMonth: revenueThisMonth,
        thisWeek: revenueThisWeek,
        weeklyGrowth: 0, // Calcular vs mes anterior si tienes datos
      },
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching advanced analytics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
