import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { GET_ORDERS_BY_PRODUCT_QUERY } from '@/src/modules/customer/queries'

interface GraphQLResponse {
  data?: unknown
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

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching orders by product:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch orders by product' }, { status: 500 })
  }
}
