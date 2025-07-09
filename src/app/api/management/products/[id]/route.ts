import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { requirePermission } from '@/modules/auth/server/server'
import { productService } from '@/services/product/service'
import { type UpdateProductPayload } from '@/services/product/types'

function getProductGid(id: string): string {
  if (id.startsWith('gid://shopify/Product/')) {
    return id
  }
  return `gid://shopify/Product/${id}`
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission(PERMISSIONS.MANAGE_PRODUCTS)
    const { id } = await params
    const productGid = getProductGid(id)

    const product = await productService.getProductById(productGid, session)

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado o acceso denegado.' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission(PERMISSIONS.MANAGE_PRODUCTS)
    const { id } = await params
    const productGid = getProductGid(id)
    const body = await request.json()

    const payload: UpdateProductPayload = { ...body, id: productGid }

    const updatedProduct = await productService.updateProduct(payload, session)

    return NextResponse.json(updatedProduct)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission(PERMISSIONS.MANAGE_PRODUCTS)
    const { id } = await params
    const productGid = getProductGid(id)

    const deletedProductId = await productService.deleteProduct(productGid, session)

    return NextResponse.json({ deletedProductId, message: 'Producto eliminado exitosamente' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
