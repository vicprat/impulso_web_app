/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { requirePermission } from '@/src/modules/auth/server/server'
import { getAllUsers } from '@/src/modules/user/user.service'
import { productService } from '@/src/services/product/service'

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

    const today = new Date()
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const shopifyQuery = `
      query {
        orders(query: "created_at:>=${firstDayOfPreviousMonth.toISOString()} created_at:<=${today.toISOString()}", first: 250) {
          edges {
            node {
              id
              createdAt
              displayFinancialStatus
              currentTotalPriceSet {
                shopMoney {
                  amount
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const shopifyResponse: ShopifyOrdersResponse = await makeAdminApiRequest(shopifyQuery)

    const { products: managementProducts } = await productService.getProducts(
      { limit: 100 },
      session
    )
    const { users } = await getAllUsers({})

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const orders: ShopifyOrderEdge[] = shopifyResponse.orders.edges
    const totalOrders = orders.length
    const totalSales = orders.reduce((sum: number, order: ShopifyOrderEdge) => {
      const amount = parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0')
      return sum + amount
    }, 0)

    const salesByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - (5 - i), 1)
      const monthOrders = orders.filter((order: ShopifyOrderEdge) => {
        const orderDate = new Date(order.node.createdAt)
        return (
          orderDate.getMonth() === month.getMonth() &&
          orderDate.getFullYear() === month.getFullYear()
        )
      })

      const monthSales = monthOrders.reduce((sum: number, order: ShopifyOrderEdge) => {
        const amount = parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0')
        return sum + amount
      }, 0)

      return {
        month: month.toLocaleDateString('es-ES', { month: 'short' }),
        orders: monthOrders.length,
        products: new Set(
          monthOrders.flatMap((order: ShopifyOrderEdge) =>
            order.node.lineItems.edges.map((item: ShopifyLineItemEdge) => item.node.id)
          )
        ).size,
        sales: monthSales,
      }
    })

    const products = managementProducts ?? []
    const productSalesMap = new Map<
      string,
      { name: string; artist: string; sales: number; units: number }
    >()
    const artistsMap = new Map<string, { name: string; products: number; sales: number }>()

    orders.forEach((order: ShopifyOrderEdge) => {
      order.node.lineItems.edges.forEach((item: ShopifyLineItemEdge) => {
        const productName = item.node.title
        const quantity = item.node.quantity
        const price = parseFloat(item.node.originalUnitPriceSet?.shopMoney?.amount ?? '0')
        const itemSales = quantity * price

        const product = products.find((p) => p.title === productName)
        const artistName = product?.vendor ?? 'Artista Desconocido'

        if (productSalesMap.has(productName)) {
          const existing = productSalesMap.get(productName)!
          existing.sales += itemSales
          existing.units += quantity
        } else {
          productSalesMap.set(productName, {
            artist: artistName,
            name: productName,
            sales: itemSales,
            units: quantity,
          })
        }

        if (!artistsMap.has(artistName)) {
          artistsMap.set(artistName, {
            name: artistName,
            products: 0,
            sales: 0,
          })
        }
        const artist = artistsMap.get(artistName)!
        artist.sales += itemSales
      })
    })

    products.forEach((product) => {
      const artistName = product.vendor ?? 'Artista Desconocido'
      if (!artistsMap.has(artistName)) {
        artistsMap.set(artistName, {
          name: artistName,
          products: 0,
          sales: 0,
        })
      }
      const artist = artistsMap.get(artistName)!
      artist.products += 1
    })

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    const artistStats = Array.from(artistsMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    const categoriesMap = new Map()
    products.forEach((product) => {
      const category = product.productType ?? 'Sin categoría'
      categoriesMap.set(category, (categoriesMap.get(category) ?? 0) + 1)
    })

    const productCategories = Array.from(categoriesMap.entries()).map(([name, value], index) => ({
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'][index % 5],
      name,
      value,
    }))

    interface AdminRecentActivityItem {
      id: string
      message: string
      type: 'sale' | 'product' | 'user' | 'event'
      amount?: number
    }

    const recentSales: AdminRecentActivityItem[] = orders.slice(0, 4).map((order) => ({
      amount: parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
      createdAt: order.node.createdAt,
      id: order.node.id,
      message: `Nueva venta por ${parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0').toFixed(2)}`,
      time: `${Math.floor((new Date().getTime() - new Date(order.node.createdAt).getTime()) / (1000 * 60 * 60))} horas`,
      type: 'sale',
    }))

    const recentProducts: AdminRecentActivityItem[] = products.slice(0, 4).map((product) => ({
      id: product.id,
      message: `Nuevo producto añadido: ${product.title}`,
      type: 'product',
    }))

    const recentUsers: AdminRecentActivityItem[] = users.slice(0, 4).map((user) => ({
      createdAt: user.createdAt,
      id: user.id,
      message: `Nuevo usuario registrado: ${user.firstName ?? ''} ${user.lastName ?? ''}`,
      time: `${Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60))} horas`,
      type: 'user',
    }))

    const combinedRecentActivity: AdminRecentActivityItem[] = [
      ...recentSales,
      ...recentProducts,
      ...recentUsers,
    ]

    const recentActivity = combinedRecentActivity

    const totalProducts = products.length
    const lowStock = products.filter(
      (p) =>
        (p.primaryVariant?.inventoryQuantity ?? 0) < 5 &&
        (p.primaryVariant?.inventoryQuantity ?? 0) > 0
    ).length
    const outOfStock = products.filter(
      (p) => (p.primaryVariant?.inventoryQuantity ?? 0) === 0
    ).length
    const totalInventoryValue = products.reduce((sum, product) => {
      const price = parseFloat(product.primaryVariant?.price?.amount ?? '0')
      const quantity = product.primaryVariant?.inventoryQuantity ?? 0
      return sum + price * quantity
    }, 0)

    const totalRevenue = totalSales
    const totalExpenses = totalRevenue * 0.3
    const totalProfit = totalRevenue * 0.7
    const pendingPayments = orders
      .filter((order) => order.node.displayFinancialStatus === 'PENDING')
      .reduce((sum, order) => {
        const amount = parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0')
        return sum + amount
      }, 0)

    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length

    const averageOrderValue =
      orders.length > 0
        ? orders.reduce(
            (sum, order) =>
              sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
            0
          ) / orders.length
        : 0

    const totalUsers = users?.length ?? 0

    const salesCurrentMonth = orders
      .filter(
        (order) =>
          new Date(order.node.createdAt).getMonth() === today.getMonth() &&
          new Date(order.node.createdAt).getFullYear() === today.getFullYear()
      )
      .reduce(
        (sum: number, order: ShopifyOrderEdge) =>
          sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
        0
      )

    const salesPreviousMonth = orders
      .filter(
        (order) =>
          new Date(order.node.createdAt).getMonth() === firstDayOfPreviousMonth.getMonth() &&
          new Date(order.node.createdAt).getFullYear() === firstDayOfPreviousMonth.getFullYear()
      )
      .reduce(
        (sum: number, order: ShopifyOrderEdge) =>
          sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
        0
      )

    const monthlyGrowth =
      salesPreviousMonth > 0
        ? ((salesCurrentMonth - salesPreviousMonth) / salesPreviousMonth) * 100
        : 0

    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0

    const data = {
      activeProducts,
      artistStats,
      averageOrderValue,

      events: {
        active: 1,
        ticketsSold: 89,
        totalTickets: 156,
        upcoming: 3,
      },

      financialSummary: {
        expenses: totalExpenses,
        pendingPayments,
        profit: totalProfit,
        revenue: totalRevenue,
      },

      inventory: {
        lowStock,
        outOfStock,
        totalValue: totalInventoryValue,
      },

      overview: {
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        monthlyGrowth,
        totalOrders,
        totalProducts,
        totalSales: Math.round(totalSales),
        totalUsers,
      },

      productCategories,

      recentActivity,

      salesData: salesByMonth,
      topProducts,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
