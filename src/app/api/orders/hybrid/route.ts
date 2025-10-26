import { NextResponse, type NextRequest } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { getHybridOrders } from '@/services/order/hybridOrdersService'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.VIEW_ALL_ORDERS)

    const { searchParams } = new URL(request.url)
    const firstParam = searchParams.get('first')
    const after = searchParams.get('after') ?? undefined
    const query = searchParams.get('query') ?? undefined
    const sortBy = searchParams.get('sortBy') ?? undefined
    const sortOrder = searchParams.get('sortOrder') ?? undefined

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

    const data = await getHybridOrders({
      after,
      first,
      query,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching hybrid orders:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
