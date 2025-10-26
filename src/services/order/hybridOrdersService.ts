import { prisma } from '@/lib/prisma'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { GET_ALL_ORDERS_QUERY } from '@/src/modules/customer/queries'

export interface HybridOrder {
  id: string
  name: string
  processedAt: string
  displayFinancialStatus: string
  displayFulfillmentStatus: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
  customer: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  lineItemsCount: number
  requiresShipping: boolean
  shippingLine?: {
    title: string
    code?: string
  }
  source: 'shopify' | 'local'
  hasLocalData: boolean
  tickets?: {
    id: string
    eventId: string
    qrCode: string
    status: string
    quantity: number
  }[]
}

export interface HybridOrdersResult {
  orders: {
    edges: { node: HybridOrder }[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor?: string | null
      endCursor?: string | null
    }
  }
}

export interface HybridOrdersParams {
  after?: string
  first?: number
  query?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Combines Shopify orders with local database data to provide a complete view
 * This ensures consistency between Shopify and the local DB
 */
export async function getHybridOrders(params?: HybridOrdersParams): Promise<HybridOrdersResult> {
  const { after, first = 10, query, sortBy, sortOrder } = params ?? {}

  // Map our sortBy values to Shopify OrderSortKeys enum
  const sortKeyMap: Record<string, string> = {
    name: 'NUMBER',
    processedAt: 'PROCESSED_AT',
    totalPrice: 'TOTAL_PRICE',
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT',
    id: 'ID',
    relevance: 'RELEVANCE',
  }

  const shopifySortKey = sortBy ? sortKeyMap[sortBy] : 'PROCESSED_AT'
  const shopifyReverse = sortOrder === 'asc'

  try {
    // Fetch orders from Shopify Admin API
    const shopifyOrdersResponse = await makeAdminApiRequest<{
      orders: {
        edges: {
          node: {
            id: string
            name: string
            processedAt: string
            displayFinancialStatus: string
            displayFulfillmentStatus: string
            totalPriceSet: {
              shopMoney: {
                amount: string
                currencyCode: string
              }
            }
            customer: {
              id: string
              firstName?: string
              lastName?: string
              email?: string
            }
            lineItemsCount: number
            requiresShipping: boolean
            shippingLine?: {
              title: string
              code?: string
            }
          }
          cursor: string
        }[]
        pageInfo: {
          hasNextPage: boolean
          hasPreviousPage: boolean
          startCursor?: string | null
          endCursor?: string | null
        }
      }
    }>(GET_ALL_ORDERS_QUERY, {
      after,
      first,
      query,
      reverse: shopifyReverse,
      sortKey: shopifySortKey,
    })

    // Get all order IDs from Shopify
    const shopifyOrderIds = shopifyOrdersResponse.orders.edges.map((edge) => {
      // Extract numeric order ID from Shopify GID
      const orderId = edge.node.id.replace('gid://shopify/Order/', '')
      return orderId
    })

    // Fetch local data (tickets and financial entries) for these orders
    const localTickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            id: true,
            lastName: true,
          },
        },
      },
      where: {
        orderId: {
          in: shopifyOrderIds,
        },
      },
    })

    const localFinancialEntries = await prisma.financialEntry.findMany({
      where: {
        source: 'Shopify Order',
        sourceId: {
          in: shopifyOrderIds,
        },
      },
    })

    // Create maps for quick lookup
    const ticketsByOrderId = new Map<string, typeof localTickets>()
    const financialEntriesByOrderId = new Map<string, typeof localFinancialEntries>()

    for (const ticket of localTickets) {
      if (!ticket.orderId) continue
      if (!ticketsByOrderId.has(ticket.orderId)) {
        ticketsByOrderId.set(ticket.orderId, [])
      }
      ticketsByOrderId.get(ticket.orderId)!.push(ticket)
    }

    for (const entry of localFinancialEntries) {
      if (!entry.sourceId) continue
      if (!financialEntriesByOrderId.has(entry.sourceId)) {
        financialEntriesByOrderId.set(entry.sourceId, [])
      }
      financialEntriesByOrderId.get(entry.sourceId)!.push(entry)
    }

    // Combine Shopify data with local data
    const hybridOrders: HybridOrder[] = shopifyOrdersResponse.orders.edges.map((edge) => {
      const shopifyOrder = edge.node
      const orderId = shopifyOrder.id.replace('gid://shopify/Order/', '')

      const tickets = ticketsByOrderId.get(orderId) ?? []
      const financialEntries = financialEntriesByOrderId.get(orderId) ?? []

      // Build customer info - prefer Shopify data but use local as fallback
      const customer = {
        email:
          shopifyOrder.customer?.email ?? tickets[0]?.user.email ?? 'no-disponible@example.com',
        firstName: shopifyOrder.customer?.firstName ?? tickets[0]?.user.firstName ?? undefined,
        id: shopifyOrder.customer?.id ?? tickets[0]?.user.id ?? 'unknown',
        lastName: shopifyOrder.customer?.lastName ?? tickets[0]?.user.lastName ?? undefined,
      }

      // Calculate local line items count if we have tickets
      const localLineItemsCount = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)

      // Use Shopify line items count unless we have local tickets that give us more info
      const finalLineItemsCount = shopifyOrder.lineItemsCount ?? localLineItemsCount ?? 0

      return {
        customer,
        displayFinancialStatus: shopifyOrder.displayFinancialStatus,
        displayFulfillmentStatus: shopifyOrder.displayFulfillmentStatus,
        hasLocalData: tickets.length > 0 || financialEntries.length > 0,
        id: shopifyOrder.id,
        lineItemsCount: finalLineItemsCount,
        name: shopifyOrder.name,
        processedAt: shopifyOrder.processedAt,
        requiresShipping: shopifyOrder.requiresShipping,
        shippingLine: shopifyOrder.shippingLine,
        source: 'shopify',
        tickets:
          tickets.length > 0
            ? tickets.map((t) => ({
                eventId: t.eventId,
                id: t.id,
                qrCode: t.qrCode,
                quantity: t.quantity,
                status: t.status,
              }))
            : undefined,
        totalPrice: {
          amount: shopifyOrder.totalPriceSet.shopMoney.amount,
          currencyCode: shopifyOrder.totalPriceSet.shopMoney.currencyCode,
        },
      }
    })

    return {
      orders: {
        edges: hybridOrders.map((order) => ({ node: order })),
        pageInfo: shopifyOrdersResponse.orders.pageInfo,
      },
    }
  } catch (error) {
    console.error('Error in hybrid orders service:', error)

    // If Shopify API fails, fall back to local orders only
    console.info('Falling back to local orders...')

    // Fetch orders from local database
    const offset = after ? parseInt(after) : 0
    const whereConditions: Record<string, unknown> = {}
    if (query) {
      whereConditions.OR = [
        { orderId: { contains: query } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
        { user: { firstName: { contains: query, mode: 'insensitive' } } },
        { user: { lastName: { contains: query, mode: 'insensitive' } } },
      ]
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            id: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: first + 1,
      where: whereConditions,
    })

    const ordersMap = new Map<string, HybridOrder>()
    for (const ticket of tickets) {
      if (!ticket.orderId) continue
      const orderId = ticket.orderId

      if (!ordersMap.has(orderId)) {
        const financialEntry = await prisma.financialEntry.findFirst({
          orderBy: { createdAt: 'desc' },
          where: {
            source: 'Shopify Order',
            sourceId: orderId,
          },
        })

        ordersMap.set(orderId, {
          customer: {
            email: ticket.user.email,
            firstName: ticket.user.firstName ?? undefined,
            id: ticket.user.id,
            lastName: ticket.user.lastName ?? undefined,
          },
          displayFinancialStatus: 'PAID',
          displayFulfillmentStatus: 'UNFULFILLED',
          hasLocalData: true,
          id: `gid://shopify/Order/${orderId}`,
          lineItemsCount: 0,
          name: `#${orderId}`,
          processedAt: ticket.createdAt.toISOString(),
          requiresShipping: false,
          source: 'local',
          tickets: [],
          totalPrice: {
            amount: financialEntry?.amount.toString() ?? '0',
            currencyCode: financialEntry?.currency ?? 'MXN',
          },
        })
      }

      const order = ordersMap.get(orderId)!
      order.tickets!.push({
        eventId: ticket.eventId,
        id: ticket.id,
        qrCode: ticket.qrCode,
        quantity: ticket.quantity,
        status: ticket.status,
      })
    }

    const orders = Array.from(ordersMap.values())
      .map((order) => ({
        ...order,
        lineItemsCount: order.tickets?.length ?? 0,
      }))
      .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())

    const hasNextPage = tickets.length > first
    const paginatedOrders = orders.slice(0, first)

    const startCursor = paginatedOrders.length > 0 ? offset.toString() : null
    const endCursor = hasNextPage ? (offset + first).toString() : null

    return {
      orders: {
        edges: paginatedOrders.map((order) => ({ node: order })),
        pageInfo: {
          endCursor,
          hasNextPage,
          hasPreviousPage: offset > 0,
          startCursor,
        },
      },
    }
  }
}
