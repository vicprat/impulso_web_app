import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { GET_ORDERS_BY_PRODUCT_QUERY } from '@/src/modules/customer/queries'

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

    const data = await makeAdminApiRequest(GET_ORDERS_BY_PRODUCT_QUERY, {
      after,
      first,
      query: `product_id:${productId}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching orders by product:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch orders by product' }, { status: 500 })
  }
}
