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
  const { after, first = 10, query } = params ?? {}

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
    where: whereConditions, // +1 para determinar si hay más páginas
  })

  // Agrupar tickets por orderId
  const ordersMap = new Map<string, LocalOrder>()

  for (const ticket of tickets) {
    if (!ticket.orderId) continue

    const orderId = ticket.orderId

    if (!ordersMap.has(orderId)) {
      // Buscar información financiera para esta orden
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

        // Asumimos que si hay ticket, la orden está pagada
        displayFulfillmentStatus: 'FULFILLED',

        id: orderId,
        lineItemsCount: 0,
        name: `#${orderId}`,

        processedAt: ticket.createdAt.toISOString(),

        // Se calculará después
        tickets: [],
        // Asumimos que está cumplida
        totalPrice: {
          amount: financialEntry?.amount.toString() ?? '0',
          currencyCode: financialEntry?.currency ?? 'MXN',
        },
      })
    }

    const order = ordersMap.get(orderId)!
    order.tickets.push({
      eventId: ticket.eventId,
      id: ticket.id,
      qrCode: ticket.qrCode,
      quantity: ticket.quantity,
      status: ticket.status,
    })
  }

  // Calcular lineItemsCount y ordenar órdenes
  const orders = Array.from(ordersMap.values())
    .map((order) => ({
      ...order,
      lineItemsCount: order.tickets.length,
    }))
    .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())

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
      edges: paginatedOrders.map((order) => ({ node: order })),
      pageInfo: {
        endCursor,
        hasNextPage,
        hasPreviousPage,
        startCursor,
      },
    },
  }
}

export async function getLocalOrderById(orderId: string): Promise<LocalOrder | null> {
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
    where: { orderId },
  })

  if (tickets.length === 0) return null

  const ticket = tickets[0]

  // Buscar información financiera para esta orden
  const financialEntry = await prisma.financialEntry.findFirst({
    orderBy: { createdAt: 'desc' },
    where: {
      source: 'Shopify Order',
      sourceId: orderId,
    },
  })

  return {
    customer: {
      email: ticket.user.email,
      firstName: ticket.user.firstName ?? undefined,
      id: ticket.user.id,
      lastName: ticket.user.lastName ?? undefined,
    },
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'FULFILLED',
    id: orderId,
    lineItemsCount: tickets.length,
    name: `#${orderId}`,
    processedAt: ticket.createdAt.toISOString(),
    tickets: tickets.map((t) => ({
      eventId: t.eventId,
      id: t.id,
      qrCode: t.qrCode,
      quantity: t.quantity,
      status: t.status,
    })),
    totalPrice: {
      amount: financialEntry?.amount.toString() ?? '0',
      currencyCode: financialEntry?.currency ?? 'MXN',
    },
  }
}

export interface LocalOrderDetail {
  id: string
  name: string
  processedAt: string
  createdAt: string
  updatedAt: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
  fulfillmentStatus: string
  financialStatus: string
  currencyCode: string
  email: string
  cancelledAt?: string | null
  cancelReason?: string | null
  confirmationNumber: string
  edited: boolean
  requiresShipping: boolean
  statusPageUrl?: string
  lineItems: {
    edges: {
      node: {
        id: string
        title: string
        quantity: number
        price: {
          amount: string
          currencyCode: string
        }
      }
    }[]
  }
  shippingAddress?: {
    id: string
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    zip: string
    country: string
  }
  billingAddress?: {
    id: string
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    zip: string
    country: string
  }
  subtotal: {
    amount: string
    currencyCode: string
  }
  totalRefunded: {
    amount: string
    currencyCode: string
  }
  totalShipping: {
    amount: string
    currencyCode: string
  }
  totalTax: {
    amount: string
    currencyCode: string
  }
  fulfillments: {
    edges: {
      node: {
        id: string
        status: string
        updatedAt: string
      }
    }[]
  }
}

export async function getLocalOrderDetailById(orderId: string): Promise<LocalOrderDetail | null> {
  // Buscar todas las entradas financieras para esta orden
  const financialEntries = await prisma.financialEntry.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      source: 'Shopify Order',
      sourceId: orderId,
    },
  })

  if (financialEntries.length === 0) return null

  const firstEntry = financialEntries[0]

  // Buscar tickets para obtener información del usuario
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
    where: { orderId },
  })

  const user = tickets[0]?.user || null
  if (!user) return null

  // Calcular totales
  const totalAmount = financialEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)

  // Crear line items basados en las entradas financieras
  const lineItems = financialEntries.map((entry, index) => ({
    node: {
      id: `local-${orderId}-${index}`,
      // Simplificado por ahora
      price: {
        amount: entry.amount.toString(),
        currencyCode: entry.currency,
      },

      quantity: 1,
      title: entry.description
        .replace(/^Venta de /, '')
        .replace(/ \(Cantidad: \d+\) - Orden #.*$/, ''),
    },
  }))

  return {
    billingAddress: undefined,
    cancelReason: null,
    cancelledAt: null,
    confirmationNumber: orderId,
    createdAt: firstEntry.createdAt.toISOString(),
    currencyCode: firstEntry.currency,
    edited: false,
    email: user.email,
    financialStatus: 'PAID',
    fulfillmentStatus: 'FULFILLED',
    fulfillments: {
      edges: [
        {
          node: {
            id: `local-fulfillment-${orderId}`,
            status: 'FULFILLED',
            updatedAt: firstEntry.updatedAt.toISOString(),
          },
        },
      ],
    },
    id: orderId,
    lineItems: {
      edges: lineItems,
    },
    name: `#${orderId}`,
    processedAt: firstEntry.date.toISOString(),
    requiresShipping: false,
    shippingAddress:
      user.firstName && user.lastName
        ? {
            address1: 'Dirección no disponible',
            city: 'Ciudad no disponible',
            country: 'México',
            firstName: user.firstName,
            id: `local-address-${orderId}`,
            lastName: user.lastName,
            zip: '00000',
          }
        : undefined,
    statusPageUrl: undefined,
    subtotal: {
      amount: totalAmount.toString(),
      currencyCode: firstEntry.currency,
    },
    totalPrice: {
      amount: totalAmount.toString(),
      currencyCode: firstEntry.currency,
    },
    totalRefunded: {
      amount: '0',
      currencyCode: firstEntry.currency,
    },
    totalShipping: {
      amount: '0',
      currencyCode: firstEntry.currency,
    },
    totalTax: {
      amount: '0',
      currencyCode: firstEntry.currency,
    },
    updatedAt: firstEntry.updatedAt.toISOString(),
  }
}
