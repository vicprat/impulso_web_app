import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { GET_ORDERS_BY_PRODUCT_QUERY } from '@/src/modules/customer/queries'
import { getUsersByShopifyCustomerIds } from '@/src/modules/user/user.service'

interface OrderCustomer {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  localUserId?: string
  profile?: {
    bio?: string | null
  } | null
}

interface OrderLineItem {
  id: string
  title: string
  quantity: number
  currentQuantity: number
  originalUnitPriceSet: {
    shopMoney: {
      amount: string
      currencyCode: string
    }
  }
  discountedUnitPriceSet: {
    shopMoney: {
      amount: string
      currencyCode: string
    }
  }
  variant: {
    id: string
    title: string
    sku: string | null
  }
}

interface Order {
  id: string
  name: string
  processedAt: string
  createdAt: string
  updatedAt: string
  displayFulfillmentStatus: string
  displayFinancialStatus: string
  currencyCode: string
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
  customer?: OrderCustomer
  lineItems: {
    edges: {
      node: OrderLineItem
    }[]
  }
  fulfillments: {
    id: string
    status: string
  }[]
}

interface OrdersData {
  orders: {
    edges: {
      node: Order
      cursor: string
    }[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
  }
}

interface GraphQLResponse {
  data?: OrdersData
  errors?: {
    message: string
    locations?: { line: number; column: number }[]
    path?: string[]
    extensions?: Record<string, unknown>
  }[]
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.VIEW_ALL_ORDERS)

    const { searchParams } = new URL(request.url)
    const firstParam = searchParams.get('first')
    const after = searchParams.get('after') ?? undefined
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required "productId" parameter.' },
        { status: 400 }
      )
    }

    let first = 10
    if (firstParam) {
      const parsedFirst = parseInt(firstParam)
      if (isNaN(parsedFirst) || parsedFirst < 1 || parsedFirst > 250) {
        return NextResponse.json(
          { error: 'Invalid "first" parameter. Must be between 1 and 250.' },
          { status: 400 }
        )
      }
      first = parsedFirst
    }

    // Construir la query para filtrar por producto específico
    const query = `product_id:${productId}`

    const data = (await makeAdminApiRequest(GET_ORDERS_BY_PRODUCT_QUERY, {
      after,
      first,
      query: `product_id:${productId}`,
    })) as GraphQLResponse

    // Verificar si hay errores de GraphQL en la respuesta
    if (data.errors && data.errors.length > 0) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json(
        {
          details: data.errors,
          error: 'GraphQL errors occurred',
          message: 'Some data may be limited due to API permissions',
        },
        { status: 400 }
      )
    }

    // Enriquecer los datos con información local del usuario
    if (data.data?.orders?.edges) {
      const orders = data.data.orders.edges

      // Extraer todos los shopifyCustomerIds únicos
      const shopifyCustomerIds = orders
        .map((order) => order.node.customer?.id)
        .filter((id): id is string => !!id)
        .map((id) => id.replace('gid://shopify/Customer/', ''))
        .filter((id, index, array) => array.indexOf(id) === index) // Eliminar duplicados

      if (shopifyCustomerIds.length > 0) {
        // Obtener información local de los usuarios
        const localUsers = await getUsersByShopifyCustomerIds(shopifyCustomerIds)

        // Crear un mapa para acceso rápido
        const userMap = new Map(localUsers.map((user) => [user.shopifyCustomerId, user]))

        // Enriquecer cada orden con la información local del usuario
        orders.forEach((order) => {
          if (order.node.customer?.id) {
            const shopifyId = order.node.customer.id.replace('gid://shopify/Customer/', '')
            const localUser = userMap.get(shopifyId)

            if (localUser) {
              // Agregar información local del usuario a la orden
              order.node.customer = {
                ...order.node.customer,
                email: localUser.email,
                firstName: localUser.firstName || null,
                lastName: localUser.lastName || null,
                localUserId: localUser.id,
                profile: localUser.profile
                  ? {
                      bio: localUser.profile.bio,
                    }
                  : null,
              }
            }
          }
        })
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching orders by product:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch orders by product' }, { status: 500 })
  }
}
