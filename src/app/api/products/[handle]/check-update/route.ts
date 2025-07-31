import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { api } from '@/modules/shopify/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const { productId, lastUpdate } = await request.json()

    // Obtener el producto actual desde Shopify
    const productResponse = await api.getProductByHandle(handle)
    const product = productResponse.data

    // Verificar si el producto ha sido actualizado
    const productUpdatedAt = new Date(product.createdAt).getTime()
    const hasUpdates = productUpdatedAt > lastUpdate

    return NextResponse.json({
      hasUpdates,
      lastUpdate: productUpdatedAt,
      productId: product.id,
    })
  } catch (error) {
    console.error('Error verificando actualizaciones:', error)
    return NextResponse.json(
      {
        hasUpdates: false,
        error: 'Error verificando actualizaciones',
      },
      { status: 500 }
    )
  }
} 