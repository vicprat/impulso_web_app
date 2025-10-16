import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

interface FulfillmentLineItem {
  id: string
  quantity: number
}

interface CreateFulfillmentInput {
  orderId: string
  lineItems: FulfillmentLineItem[]
  trackingInfo?: {
    company?: string
    number?: string
    url?: string
  }
  notifyCustomer?: boolean
}

interface FulfillmentResponse {
  fulfillmentCreateV2: {
    fulfillment: {
      id: string
      status: string
      trackingInfo: {
        company: string | null
        number: string | null
        url: string | null
      }[]
      createdAt: string
    } | null
    userErrors: {
      field: string[]
      message: string
    }[]
  }
}

const GET_FULFILLMENT_ORDERS_QUERY = `
  query GetFulfillmentOrders($orderId: ID!) {
    order(id: $orderId) {
      id
      displayFulfillmentStatus
      fulfillmentOrders(first: 10, query: "status:open OR status:in_progress OR status:on_hold") {
        edges {
          node {
            id
            status
            lineItems(first: 50) {
              edges {
                node {
                  id
                  lineItem {
                    id
                  }
                  remainingQuantity
                }
              }
            }
          }
        }
      }
    }
  }
`

const CREATE_FULFILLMENT_MUTATION = `
  mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
    fulfillmentCreateV2(fulfillment: $fulfillment) {
      fulfillment {
        id
        status
        trackingInfo {
          company
          number
          url
        }
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const shopifyFulfillmentService = {
  async createFulfillment(input: CreateFulfillmentInput) {
    // Primero, obtener el FulfillmentOrder ID
    const shopifyOrderId = `gid://shopify/Order/${input.orderId}`

    const fulfillmentOrdersResponse = await makeAdminApiRequest<{
      order: {
        id: string
        displayFulfillmentStatus: string
        fulfillmentOrders: {
          edges: {
            node: {
              id: string
              status: string
              lineItems: {
                edges: {
                  node: {
                    id: string
                    lineItem: { id: string }
                    remainingQuantity: number
                  }
                }[]
              }
            }
          }[]
        }
      }
    }>(GET_FULFILLMENT_ORDERS_QUERY, { orderId: shopifyOrderId })

    const fulfillmentOrders = fulfillmentOrdersResponse.order.fulfillmentOrders.edges

    if (fulfillmentOrders.length === 0) {
      const status = fulfillmentOrdersResponse.order.displayFulfillmentStatus

      if (status === 'FULFILLED') {
        throw new Error('Esta orden ya ha sido cumplida completamente')
      }

      if (status === 'UNFULFILLED') {
        throw new Error(
          'Esta orden no tiene órdenes de cumplimiento disponibles. ' +
            'Si es una orden de prueba, necesitas marcarla como "Pagada" primero en Shopify Admin. ' +
            'Si es una orden real, espera unos segundos y vuelve a intentar.'
        )
      }

      throw new Error(
        `No se encontraron órdenes de cumplimiento disponibles. Estado actual: ${status}.`
      )
    }

    // Usar el primer fulfillment order disponible
    const fulfillmentOrder = fulfillmentOrders[0].node

    // Mapear los line items al formato correcto
    const fulfillmentOrderLineItems = input.lineItems.map((inputItem) => {
      const foLineItem = fulfillmentOrder.lineItems.edges.find(
        (edge) => edge.node.lineItem.id === inputItem.id
      )

      if (!foLineItem) {
        throw new Error(`Line item ${inputItem.id} not found in fulfillment order`)
      }

      return {
        id: foLineItem.node.id,
        quantity: inputItem.quantity,
      }
    })

    const fulfillmentInput: Record<string, unknown> = {
      lineItemsByFulfillmentOrder: [
        {
          fulfillmentOrderId: fulfillmentOrder.id,
          fulfillmentOrderLineItems,
        },
      ],
      notifyCustomer: input.notifyCustomer ?? false,
    }

    if (input.trackingInfo) {
      fulfillmentInput.trackingInfo = {
        company: input.trackingInfo.company,
        number: input.trackingInfo.number,
        url: input.trackingInfo.url,
      }
    }

    const response = await makeAdminApiRequest<FulfillmentResponse>(CREATE_FULFILLMENT_MUTATION, {
      fulfillment: fulfillmentInput,
    })

    if (response.fulfillmentCreateV2?.userErrors?.length > 0) {
      throw new Error(response.fulfillmentCreateV2.userErrors.map((e) => e.message).join(', '))
    }

    return response.fulfillmentCreateV2.fulfillment
  },
}
