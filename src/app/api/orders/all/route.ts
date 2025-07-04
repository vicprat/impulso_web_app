import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { GET_ALL_ORDERS_QUERY } from '@/src/modules/customer/queries'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('view_all_orders')

    const { searchParams } = new URL(request.url)
    const firstParam = searchParams.get('first')
    const after = searchParams.get('after') ?? undefined
    const query = searchParams.get('query') ?? undefined

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

    const data = await makeAdminApiRequest(GET_ALL_ORDERS_QUERY, {
      after,
      first,
      query,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching all orders:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
