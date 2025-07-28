import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { requirePermission } from '@/modules/auth/server/server'
import { productService } from '@/services/product/service'

export async function GET(request: Request) {
  try {
    const session = await requirePermission([
      PERMISSIONS.MANAGE_PRODUCTS,
      PERMISSIONS.MANAGE_OWN_PRODUCTS,
    ])

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? undefined

    // Obtener estadísticas usando el servicio existente
    // Este método obtendrá TODOS los productos del inventario
    const stats = await productService.getProductStats(search, session)
    
    return NextResponse.json(stats)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error en endpoint de stats:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 