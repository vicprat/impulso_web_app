import { type NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/modules/auth/server/server'
import { api } from '@/modules/customer/api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const first = parseInt(searchParams.get('first') ?? '10')
    const afterParam = searchParams.get('after')
    const after = afterParam ?? undefined

    const result = await api.getOrders({ after, first })

    return NextResponse.json(
      {
        orders: result.data.orders,
        pageInfo: result.data.pageInfo,
      },
      { status: result.statusCode }
    )
  } catch (error) {
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to fetch orders',
      },
      { status: 500 }
    )
  }
}
