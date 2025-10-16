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
    const fulfillmentInput: Record<string, unknown> = {
      lineItemsByFulfillmentOrder: [
        {
          fulfillmentOrderId: input.orderId,
          fulfillmentOrderLineItems: input.lineItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
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
