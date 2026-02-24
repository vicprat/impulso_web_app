import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { CacheManager } from '@/lib/cache'
import { requirePermission } from '@/modules/auth/server/server'

export async function POST(request: Request) {
  try {
    await requirePermission([PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.MANAGE_OWN_PRODUCTS])

    const { type } = await request.json()

    if (type === 'all') {
      CacheManager.revalidateFullCatalog()
    } else if (type === 'products') {
      CacheManager.revalidateProducts()
    } else if (type === 'inventory') {
      CacheManager.revalidateInventory()
    } else if (type === 'collections') {
      CacheManager.revalidateCollections()
    }

    return NextResponse.json({ success: true, message: 'Caché invalidada exitosamente' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
