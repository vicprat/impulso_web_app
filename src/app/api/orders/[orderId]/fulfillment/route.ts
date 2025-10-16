import { NextResponse, type NextRequest } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { shopifyFulfillmentService } from '@/modules/shopify/fulfillment'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ALL_ORDERS)

    const { orderId } = await params
    const body = await request.json()

    const { lineItems, notifyCustomer, trackingInfo } = body

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: 'Line items are required' }, { status: 400 })
    }

    const fulfillment = await shopifyFulfillmentService.createFulfillment({
      lineItems,
      notifyCustomer,
      orderId,
      trackingInfo,
    })

    return NextResponse.json({ fulfillment })
  } catch (error) {
    console.error('Error creating fulfillment:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to create fulfillment' }, { status: 500 })
  }
}
