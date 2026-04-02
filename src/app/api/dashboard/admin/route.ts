import { NextResponse } from 'next/server'

import { CacheManager, registerGlobalCache } from '@/lib/cache'
import { PERMISSIONS } from '@/src/config/Permissions'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { requirePermission } from '@/src/modules/auth/server/server'
import { getAllUsers } from '@/src/modules/user/user.service'

interface DashboardCacheEntry {
  data: unknown
  fetchedAt: number
}
const dashboardCache = new Map<string, DashboardCacheEntry>()
const DASHBOARD_CACHE_TTL = 5 * 60 * 1000

registerGlobalCache('dashboard-admin', dashboardCache)

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

let primaryLocationId: string | null = null

async function getPrimaryLocationId(): Promise<string> {
  if (primaryLocationId) return primaryLocationId

  const response = await makeAdminApiRequest<{ locations: { edges: { node: { id: string } }[] } }>(
    `query { locations(first: 1, query: "is_active:true") { edges { node { id name } } } }`,
    {}
  )

  const locationId = response.locations.edges[0]?.node?.id
  if (!locationId) {
    throw new Error('No se pudo encontrar una ubicación de Shopify para gestionar el inventario.')
  }

  primaryLocationId = locationId
  return primaryLocationId
}

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.VIEW_ANALYTICS)

    const canManageUsers = session.user.permissions?.includes(PERMISSIONS.MANAGE_USERS) ?? false
    const canManageInventory =
      session.user.permissions?.includes(PERMISSIONS.MANAGE_INVENTORY) ?? false

    const cacheKey = `admin-dashboard-${session.user.id}-${canManageUsers}-${canManageInventory}`
    const cached = dashboardCache.get(cacheKey)
    const now = Date.now()
    if (cached && now - cached.fetchedAt < DASHBOARD_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const today = new Date()
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const allOrders: ShopifyOrderEdge[] = []
    let ordersHasNextPage = true
    let ordersCursor: string | undefined = undefined

    while (ordersHasNextPage) {
      const orderQuery = `
        query($after: String, $first: Int!) {
          orders(query: "created_at:>=${firstDayOfPreviousMonth.toISOString()} created_at:<=${today.toISOString()}", first: $first, after: $after) {
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
                lineItems(first: 50) {
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
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `

      const orderVariables: {
        after?: string
        first: number
      } = {
        after: ordersCursor,
        first: 250,
      }

      const orderResponse: any = await makeAdminApiRequest(orderQuery, orderVariables)
      allOrders.push(...orderResponse.orders.edges)

      ordersHasNextPage = orderResponse.orders.pageInfo.hasNextPage
      ordersCursor = orderResponse.orders.pageInfo.endCursor ?? undefined

      if (allOrders.length >= 5000) {
        break
      }
    }

    const shopifyResponse: ShopifyOrdersResponse = { orders: { edges: allOrders } }

    const managementProducts = await CacheManager.getFullCatalog('admin')

    const managementEvents = managementProducts.filter((p: any) => p.productType === 'Evento')

    let users: any[] = []
    let totalUsers = 0
    if (canManageUsers) {
      const allUsers: any[] = []
      let userPage = 1
      let userHasMore = true

      while (userHasMore) {
        const { total, users: userList } = await getAllUsers({
          limit: 100,
          page: userPage,
        })

        allUsers.push(...userList)

        userHasMore = allUsers.length < total && userPage * 100 < total
        userPage++

        if (allUsers.length >= 5000) {
          break
        }
      }

      users = allUsers
      totalUsers = users.length
    }

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
    const events = managementEvents ?? []

    const productSalesMap = new Map<
      string,
      { name: string; artist: string; sales: number; units: number; details: any }
    >()
    const artistsMap = new Map<
      string,
      { name: string; products: number; sales: number; details: any[] }
    >()

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
            details: product || null,
            name: productName,
            sales: itemSales,
            units: quantity,
          })
        }

        if (!artistsMap.has(artistName)) {
          artistsMap.set(artistName, {
            details: [],
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
          details: [],
          name: artistName,
          products: 0,
          sales: 0,
        })
      }
      const artist = artistsMap.get(artistName)!
      artist.products += 1
      artist.details.push({
        artworkDetails: product.artworkDetails,
        autoTags: product.autoTags,
        id: product.id,
        manualTags: product.manualTags,
        status: product.status,
        tags: product.tags,
        title: product.title,
      })
    })

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    const artistStats = Array.from(artistsMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((artist) => ({
        ...artist,
        topProducts: artist.details
          .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 3),
      }))

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

    const eventsMap = new Map<string, { event: any; ticketsSold: number; totalTickets: number }>()
    const upcomingEvents = events.filter((event) => !event.isPastEvent && event.status === 'ACTIVE')
    const pastEvents = events.filter((event) => event.isPastEvent && event.status === 'ACTIVE')

    const totalEvents = events.length
    const activeEvents = events.filter((event) => event.status === 'ACTIVE').length
    const upcomingEventsCount = upcomingEvents.length
    const pastEventsCount = pastEvents.length

    const eventDetails = events.map((event) => ({
      availableForSale: event.availableForSale,
      daysUntilEvent: event.daysUntilEvent,
      eventDetails: event.eventDetails,
      formattedEventDetails: event.formattedEventDetails,
      id: event.id,
      isAvailable: event.isAvailable,
      isPastEvent: event.isPastEvent,
      price: event.formattedPrice,
      status: event.status,
      title: event.title,
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
    const lowStock = products.filter((p) => {
      const qty = p.primaryVariant?.inventoryQuantity
      return qty !== null && qty !== undefined && qty < 5 && qty > 0
    }).length
    const outOfStock = products.filter((p) => {
      const qty = p.primaryVariant?.inventoryQuantity
      return qty !== null && qty !== undefined && qty === 0
    }).length
    const totalInventoryValue = products.reduce((sum, product) => {
      const price = parseFloat(product.primaryVariant?.price?.amount ?? '0')
      const quantity = product.primaryVariant?.inventoryQuantity ?? 0
      return sum + price * quantity
    }, 0)

    const productsWithArtworkDetails = products.filter(
      (p) => p.artworkDetails && Object.values(p.artworkDetails).some((value) => value !== null)
    ).length

    const productsByMedium = products.reduce(
      (acc, product) => {
        const medium = product.artworkDetails?.medium || 'Sin medio especificado'
        acc[medium] = (acc[medium] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const productsByYear = products.reduce(
      (acc, product) => {
        const year = product.artworkDetails?.year || 'Sin año especificado'
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const productsByLocation = products.reduce(
      (acc, product) => {
        const location = product.artworkDetails?.location || 'Sin ubicación especificada'
        acc[location] = (acc[location] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

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

    const data: any = {
      averageOrderValue,

      events: {
        active: activeEvents,
        details: canManageInventory ? eventDetails : eventDetails.slice(0, 5),
        ticketsSold: pastEventsCount,
        totalTickets: totalEvents,
        upcoming: upcomingEventsCount,
      },

      overview: {
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        monthlyGrowth,
        totalOrders,
        totalProducts,
        totalSales: Math.round(totalSales),
        totalUsers: canManageUsers ? totalUsers : 0,
      },

      permissions: {
        canManageInventory,
        canManageUsers,
      },

      productCategories,

      salesData: salesByMonth,

      topProducts,
    }

    if (canManageUsers) {
      data.artistStats = artistStats
      data.users = users
      data.recentActivity = recentActivity
    } else {
      data.recentActivity = recentActivity.filter((item: any) => item.type !== 'user')
    }

    if (canManageInventory) {
      data.activeProducts = activeProducts
      data.financialSummary = {
        expenses: totalExpenses,
        pendingPayments,
        profit: totalProfit,
        revenue: totalRevenue,
      }
      data.inventory = {
        lowStock,
        outOfStock,
        productsByLocation,
        productsByMedium,
        productsByYear,
        productsWithArtworkDetails,
        totalValue: totalInventoryValue,
      }
    } else {
      data.inventory = {
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
      }
    }

    dashboardCache.set(cacheKey, { data, fetchedAt: now })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
