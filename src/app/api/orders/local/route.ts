import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { getLocalOrders } from '@/services/order/localOrdersService'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.VIEW_ALL_ORDERS)

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

    const data = await getLocalOrders({
      after,
      first,
      query,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching local orders:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
