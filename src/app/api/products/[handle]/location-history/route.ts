import { NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { locationTrackingService } from '@/src/services/product/location-tracking'

export async function GET(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  try {
    await requirePermission([
      PERMISSIONS.MANAGE_PRODUCTS,
      PERMISSIONS.MANAGE_OWN_PRODUCTS,
      PERMISSIONS.VIEW_PRODUCTS,
    ])

    const { handle } = await params
    const history = await locationTrackingService.getProductLocationHistory(handle)

    return NextResponse.json(history)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
