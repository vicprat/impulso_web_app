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
    const paginatedResponse = await productService.getProductsFromRequest(request, session)
    return NextResponse.json(paginatedResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission([
      PERMISSIONS.MANAGE_PRODUCTS,
      PERMISSIONS.MANAGE_OWN_PRODUCTS,
    ])
    const newProduct = await productService.createProductFromRequest(request, session)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
