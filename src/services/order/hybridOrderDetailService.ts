import { prisma } from '@/lib/prisma'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { GET_ORDER_BY_ID_ADMIN_QUERY } from '@/src/modules/customer/queries'

import type { LocalOrderDetail } from './localOrdersService'

export interface HybridOrderDetail extends LocalOrderDetail {
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

/**
 * Combines Shopify order detail with local database data
 * ALWAYS prioritizes Shopify as the primary source, falls back to local if Shopify doesn't exist
 */
export async function getHybridOrderDetail(orderId: string): Promise<HybridOrderDetail | null> {
  // Try to determine if it's a Shopify ID or numeric ID
  const isShopifyId = orderId.startsWith('gid://shopify/Order/')
  const numericOrderId = isShopifyId ? orderId.replace('gid://shopify/Order/', '') : orderId

  // Extract numeric ID for Shopify query
  const shopifyOrderId = `gid://shopify/Order/${numericOrderId}`

  let shopifyOrder: {
    id: string
    name: string
    processedAt: string
    createdAt: string
    updatedAt: string
    displayFulfillmentStatus: string
    displayFinancialStatus: string
    currencyCode: string
    email?: string
    cancelledAt?: string | null
    cancelReason?: string | null
    confirmationNumber?: string
    edited: boolean
    requiresShipping: boolean
    statusPageUrl?: string
    shippingLine?: { title: string; code?: string }
    totalPriceSet: { shopMoney: { amount: string; currencyCode: string } }
    currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } }
    lineItems: {
      edges: {
        node: {
          id: string
          title: string
          quantity: number
          currentQuantity: number
          originalUnitPriceSet?: { shopMoney: { amount: string; currencyCode: string } }
          discountedUnitPriceSet?: { shopMoney: { amount: string; currencyCode: string } }
        }
      }[]
    }
    shippingAddress?: {
      firstName?: string
      lastName?: string
      address1?: string
      address2?: string
      city?: string
      province?: string
      country?: string
      zip?: string
      phone?: string
    }
    billingAddress?: {
      firstName?: string
      lastName?: string
      address1?: string
      address2?: string
      city?: string
      province?: string
      country?: string
      zip?: string
      phone?: string
    }
    customer?: { id: string; firstName?: string; lastName?: string; email?: string }
    fulfillments: { id: string; status: string; updatedAt: string }[]
  } | null = null

  // ALWAYS try to fetch from Shopify Admin API first (primary source)
  try {
    const response = await makeAdminApiRequest<{
      order: {
        id: string
        name: string
        processedAt: string
        createdAt: string
        updatedAt: string
        displayFulfillmentStatus: string
        displayFinancialStatus: string
        currencyCode: string
        email?: string
        cancelledAt?: string | null
        cancelReason?: string | null
        confirmationNumber?: string
        edited: boolean
        requiresShipping: boolean
        statusPageUrl?: string
        shippingLine?: {
          title: string
          code?: string
        }
        totalPriceSet: {
          shopMoney: {
            amount: string
            currencyCode: string
          }
        }
        currentTotalPriceSet: {
          shopMoney: {
            amount: string
            currencyCode: string
          }
        }
        lineItems: {
          edges: {
            node: {
              id: string
              title: string
              quantity: number
              currentQuantity: number
              originalUnitPriceSet?: {
                shopMoney: {
                  amount: string
                  currencyCode: string
                }
              }
              discountedUnitPriceSet?: {
                shopMoney: {
                  amount: string
                  currencyCode: string
                }
              }
            }
          }[]
        }
        shippingAddress?: {
          firstName?: string
          lastName?: string
          address1?: string
          address2?: string
          city?: string
          province?: string
          country?: string
          zip?: string
          phone?: string
        }
        billingAddress?: {
          firstName?: string
          lastName?: string
          address1?: string
          address2?: string
          city?: string
          province?: string
          country?: string
          zip?: string
          phone?: string
        }
        customer?: {
          id: string
          firstName?: string
          lastName?: string
          email?: string
        }
        fulfillments: {
          id: string
          status: string
          updatedAt: string
        }[]
      } | null
    }>(GET_ORDER_BY_ID_ADMIN_QUERY, { id: shopifyOrderId })

    shopifyOrder = response.order
  } catch (shopifyError) {
    console.error('Error fetching from Shopify Admin API:', shopifyError)
    // If Shopify fails, continue to try local data as fallback
  }

  // Fetch local data (tickets and financial entries) to complement Shopify data
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
    where: { orderId: numericOrderId },
  })

  const localFinancialEntries = await prisma.financialEntry.findMany({
    where: {
      source: 'Shopify Order',
      sourceId: numericOrderId,
    },
  })

  // Priority 1: If we have Shopify data, use it as the primary source
  if (shopifyOrder) {
    return {
      billingAddress: shopifyOrder.billingAddress
        ? {
            address1: shopifyOrder.billingAddress.address1 ?? '',
            address2: shopifyOrder.billingAddress.address2,
            city: shopifyOrder.billingAddress.city ?? '',
            country: shopifyOrder.billingAddress.country ?? '',
            firstName: shopifyOrder.billingAddress.firstName ?? '',
            id: `billing-${shopifyOrder.id}`,
            lastName: shopifyOrder.billingAddress.lastName ?? '',
            zip: shopifyOrder.billingAddress.zip ?? '',
          }
        : undefined,
      cancelReason: shopifyOrder.cancelReason,
      cancelledAt: shopifyOrder.cancelledAt,
      confirmationNumber: shopifyOrder.confirmationNumber ?? shopifyOrder.id,
      createdAt: shopifyOrder.createdAt,
      currencyCode: shopifyOrder.currencyCode,
      edited: shopifyOrder.edited,
      email: shopifyOrder.email ?? shopifyOrder.customer?.email ?? '',
      financialStatus: shopifyOrder.displayFinancialStatus,
      fulfillmentStatus: shopifyOrder.displayFulfillmentStatus,
      fulfillments: {
        edges: shopifyOrder.fulfillments.map((f) => ({
          node: f,
        })),
      },
      hasLocalData: localTickets.length > 0 || localFinancialEntries.length > 0,
      id: shopifyOrder.id,
      lineItems: {
        edges: shopifyOrder.lineItems.edges.map((edge) => ({
          node: {
            id: edge.node.id,
            price: {
              amount: edge.node.originalUnitPriceSet?.shopMoney?.amount ?? '0',
              currencyCode:
                edge.node.originalUnitPriceSet?.shopMoney?.currencyCode ??
                shopifyOrder!.currencyCode,
            },
            quantity: edge.node.quantity,
            title: edge.node.title,
          },
        })),
      },
      name: shopifyOrder.name,
      processedAt: shopifyOrder.processedAt,
      requiresShipping: shopifyOrder.requiresShipping,
      shippingAddress: shopifyOrder.shippingAddress
        ? {
            address1: shopifyOrder.shippingAddress.address1 ?? '',
            address2: shopifyOrder.shippingAddress.address2,
            city: shopifyOrder.shippingAddress.city ?? '',
            country: shopifyOrder.shippingAddress.country ?? '',
            firstName: shopifyOrder.shippingAddress.firstName ?? '',
            id: `shipping-${shopifyOrder.id}`,
            lastName: shopifyOrder.shippingAddress.lastName ?? '',
            zip: shopifyOrder.shippingAddress.zip ?? '',
          }
        : undefined,
      source: 'shopify',
      statusPageUrl: shopifyOrder.statusPageUrl,
      subtotal: {
        amount: shopifyOrder.totalPriceSet.shopMoney.amount,
        currencyCode: shopifyOrder.totalPriceSet.shopMoney.currencyCode,
      },
      tickets:
        localTickets.length > 0
          ? localTickets.map((t) => ({
              eventId: t.eventId,
              id: t.id,
              qrCode: t.qrCode,
              quantity: t.quantity,
              status: t.status,
            }))
          : undefined,
      totalPrice: {
        amount:
          shopifyOrder.currentTotalPriceSet?.shopMoney?.amount ??
          shopifyOrder.totalPriceSet.shopMoney.amount,
        currencyCode: shopifyOrder.totalPriceSet.shopMoney.currencyCode,
      },
      totalRefunded: {
        amount: '0',
        currencyCode: shopifyOrder.currencyCode,
      },
      totalShipping: {
        amount: '0',
        currencyCode: shopifyOrder.currencyCode,
      },
      totalTax: {
        amount: '0',
        currencyCode: shopifyOrder.currencyCode,
      },
      updatedAt: shopifyOrder.updatedAt,
    }
  }

  // Priority 2: Fall back to local data if Shopify doesn't have the order
  if (localTickets.length > 0 || localFinancialEntries.length > 0) {
    const firstEntry = localFinancialEntries[0]
    const ticket = localTickets[0]

    const totalAmount = localFinancialEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)

    return {
      billingAddress: undefined,
      cancelReason: null,
      cancelledAt: null,
      confirmationNumber: numericOrderId,
      createdAt:
        firstEntry?.createdAt.toISOString() ??
        ticket?.createdAt.toISOString() ??
        new Date().toISOString(),
      currencyCode: firstEntry?.currency ?? 'MXN',
      edited: false,
      email: ticket?.user.email ?? 'no-disponible@example.com',
      financialStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      fulfillments: {
        edges: [],
      },
      hasLocalData: true,
      id: orderId,
      lineItems: {
        edges: localFinancialEntries.map((entry, index) => ({
          node: {
            id: `local-${numericOrderId}-${index}`,
            price: {
              amount: entry.amount.toString(),
              currencyCode: entry.currency,
            },
            quantity: 1,
            title: entry.description
              .replace(/^Venta de /, '')
              .replace(/ \(Cantidad: \d+\) - Orden #.*$/, ''),
          },
        })),
      },
      name: `#${numericOrderId}`,
      processedAt: ticket?.createdAt.toISOString() ?? new Date().toISOString(),
      requiresShipping: false,
      shippingAddress: undefined,
      source: 'local',
      statusPageUrl: undefined,
      subtotal: {
        amount: totalAmount.toString(),
        currencyCode: firstEntry?.currency ?? 'MXN',
      },
      tickets: localTickets.map((t) => ({
        eventId: t.eventId,
        id: t.id,
        qrCode: t.qrCode,
        quantity: t.quantity,
        status: t.status,
      })),
      totalPrice: {
        amount: totalAmount.toString(),
        currencyCode: firstEntry?.currency ?? 'MXN',
      },
      totalRefunded: {
        amount: '0',
        currencyCode: firstEntry?.currency ?? 'MXN',
      },
      totalShipping: {
        amount: '0',
        currencyCode: firstEntry?.currency ?? 'MXN',
      },
      totalTax: {
        amount: '0',
        currencyCode: firstEntry?.currency ?? 'MXN',
      },
      updatedAt:
        firstEntry?.updatedAt.toISOString() ??
        ticket?.createdAt.toISOString() ??
        new Date().toISOString(),
    }
  }

  // If neither Shopify nor local data exists, return null
  return null
}
