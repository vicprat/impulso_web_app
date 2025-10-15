import { prisma } from '@/lib/prisma'

export interface LocalOrder {
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
  tickets: {
    id: string
    eventId: string
    qrCode: string
    status: string
    quantity: number
  }[]
}

export interface LocalOrdersResult {
  orders: {
    edges: { node: LocalOrder }[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor?: string | null
      endCursor?: string | null
    }
  }
}

export interface LocalOrdersParams {
  first?: number
  after?: string
  query?: string
}

export async function getLocalOrders(params?: LocalOrdersParams): Promise<LocalOrdersResult> {
  const { first = 10, after, query } = params ?? {}
  
  // Calcular offset basado en el cursor (simplificado para esta implementación)
  const offset = after ? parseInt(after) : 0
  
  // Construir condiciones de búsqueda
  const whereConditions: any = {}
  
  if (query) {
    whereConditions.OR = [
      { orderId: { contains: query } },
      { user: { email: { contains: query, mode: 'insensitive' } } },
      { user: { firstName: { contains: query, mode: 'insensitive' } } },
      { user: { lastName: { contains: query, mode: 'insensitive' } } },
    ]
  }

  // Obtener tickets con información del usuario y entradas financieras
  const tickets = await prisma.ticket.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: first + 1, // +1 para determinar si hay más páginas
  })

  // Agrupar tickets por orderId
  const ordersMap = new Map<string, LocalOrder>()
  
  for (const ticket of tickets) {
    if (!ticket.orderId) continue
    
    const orderId = ticket.orderId
    
    if (!ordersMap.has(orderId)) {
      // Buscar información financiera para esta orden
      const financialEntry = await prisma.financialEntry.findFirst({
        where: {
          sourceId: orderId,
          source: 'Shopify Order',
        },
        orderBy: { createdAt: 'desc' },
      })

      ordersMap.set(orderId, {
        id: orderId,
        name: `#${orderId}`,
        processedAt: ticket.createdAt.toISOString(),
        displayFinancialStatus: 'PAID', // Asumimos que si hay ticket, la orden está pagada
        displayFulfillmentStatus: 'FULFILLED', // Asumimos que está cumplida
        totalPrice: {
          amount: financialEntry?.amount.toString() ?? '0',
          currencyCode: financialEntry?.currency ?? 'MXN',
        },
        customer: {
          id: ticket.user.id,
          firstName: ticket.user.firstName ?? undefined,
          lastName: ticket.user.lastName ?? undefined,
          email: ticket.user.email,
        },
        lineItemsCount: 0, // Se calculará después
        tickets: [],
      })
    }
    
    const order = ordersMap.get(orderId)!
    order.tickets.push({
      id: ticket.id,
      eventId: ticket.eventId,
      qrCode: ticket.qrCode,
      status: ticket.status,
      quantity: ticket.quantity,
    })
  }

  // Calcular lineItemsCount y ordenar órdenes
  const orders = Array.from(ordersMap.values()).map(order => ({
    ...order,
    lineItemsCount: order.tickets.length,
  })).sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())

  // Determinar paginación
  const hasNextPage = tickets.length > first
  const hasPreviousPage = offset > 0
  
  // Tomar solo los primeros 'first' elementos
  const paginatedOrders = orders.slice(0, first)
  
  // Crear cursores para paginación
  const startCursor = paginatedOrders.length > 0 ? offset.toString() : null
  const endCursor = hasNextPage ? (offset + first).toString() : null

  return {
    orders: {
      edges: paginatedOrders.map(order => ({ node: order })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor,
        endCursor,
      },
    },
  }
}

export async function getLocalOrderById(orderId: string): Promise<LocalOrder | null> {
  const tickets = await prisma.ticket.findMany({
    where: { orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (tickets.length === 0) return null

  const ticket = tickets[0]
  
  // Buscar información financiera para esta orden
  const financialEntry = await prisma.financialEntry.findFirst({
    where: {
      sourceId: orderId,
      source: 'Shopify Order',
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    id: orderId,
    name: `#${orderId}`,
    processedAt: ticket.createdAt.toISOString(),
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'FULFILLED',
    totalPrice: {
      amount: financialEntry?.amount.toString() ?? '0',
      currencyCode: financialEntry?.currency ?? 'MXN',
    },
    customer: {
      id: ticket.user.id,
      firstName: ticket.user.firstName ?? undefined,
      lastName: ticket.user.lastName ?? undefined,
      email: ticket.user.email,
    },
    lineItemsCount: tickets.length,
    tickets: tickets.map(t => ({
      id: t.id,
      eventId: t.eventId,
      qrCode: t.qrCode,
      status: t.status,
      quantity: t.quantity,
    })),
  }
}
