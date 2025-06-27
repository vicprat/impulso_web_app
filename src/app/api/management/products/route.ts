import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { productService } from '@/services/product/service'

export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    const paginatedResponse = await productService.getProductsFromRequest(request, session)
    return NextResponse.json(paginatedResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const newProduct = await productService.createProductFromRequest(request, session)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
