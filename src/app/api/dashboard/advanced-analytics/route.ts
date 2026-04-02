import { NextResponse } from 'next/server'

import { registerGlobalCache } from '@/lib/cache'
import { PERMISSIONS } from '@/src/config/Permissions'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { requirePermission } from '@/src/modules/auth/server/server'

interface CacheEntry {
  data: unknown
  fetchedAt: number
}
const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000

const REQUEST_DELAY_MS = 200
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_BASE_MS = 1000

registerGlobalCache('dashboard-advanced-analytics', cache)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

    const cacheKey = 'advanced-analytics'
    const cached = cache.get(cacheKey)
    const now = Date.now()
    if (cached && now - cached.fetchedAt < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const allOrders: ShopifyOrderEdge[] = []
    let hasNextPage = true
    let cursor: string | undefined = undefined
    let pageCount = 0

    while (hasNextPage) {
      pageCount++

      if (pageCount > 1) {
        await delay(REQUEST_DELAY_MS)
      }

      const ordersQuery = `
        query($after: String, $first: Int!) {
          orders(first: $first, after: $after) {
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
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `

      const variables: {
        after?: string
        first: number
      } = {
        after: cursor,
        first: 250,
      }

      let retryAttempt = 0
      let success = false

      while (!success && retryAttempt < MAX_RETRY_ATTEMPTS) {
        try {
          const response: any = await makeAdminApiRequest(ordersQuery, variables)
          allOrders.push(...response.orders.edges)

          hasNextPage = response.orders.pageInfo.hasNextPage
          cursor = response.orders.pageInfo.endCursor ?? undefined
          success = true
        } catch (error: any) {
          retryAttempt++
          const isThrottled =
            error.message?.includes('Throttled') ||
            error.message?.includes('Rate limit') ||
            error.status === 429

          if (isThrottled && retryAttempt < MAX_RETRY_ATTEMPTS) {
            const retryDelay = RETRY_DELAY_BASE_MS * Math.pow(2, retryAttempt)
            console.warn(
              `⚠️ Orders throttling. Retrying in ${retryDelay}ms... (attempt ${retryAttempt}/${MAX_RETRY_ATTEMPTS})`
            )
            await delay(retryDelay)
          } else if (retryAttempt < MAX_RETRY_ATTEMPTS) {
            const retryDelay = RETRY_DELAY_BASE_MS * retryAttempt
            console.warn(
              `⚠️ Orders fetch error. Retrying in ${retryDelay}ms... (attempt ${retryAttempt}/${MAX_RETRY_ATTEMPTS})`
            )
            await delay(retryDelay)
          } else {
            console.error(`❌ Failed to fetch orders after ${MAX_RETRY_ATTEMPTS} attempts`)
            throw error
          }
        }
      }

      if (allOrders.length >= 5000) {
        break
      }
    }

    const orders: ShopifyOrderEdge[] = allOrders
    const currentDate = new Date()

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
        monthlyGrowth: 0,
        thisMonth: revenueThisMonth,
        thisWeek: revenueThisWeek,
        weeklyGrowth: 0,
      },
    }

    cache.set(cacheKey, { data, fetchedAt: now })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching advanced analytics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
