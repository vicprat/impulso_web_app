import { NextResponse, type NextRequest } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { getHybridOrderDetail } from '@/services/order/hybridOrderDetailService'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.VIEW_ALL_ORDERS)

    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const orderDetail = await getHybridOrderDetail(orderId)

    if (!orderDetail) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order: orderDetail })
  } catch (error) {
    console.error('Error fetching hybrid order detail:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch order detail' }, { status: 500 })
  }
}
