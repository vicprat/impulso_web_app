import { NextResponse } from 'next/server'

import { api } from '@/modules/shopify/api'

import type { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const { lastUpdate, productId } = await request.json()

    const productResponse = await api.getProductByHandle(handle)
    const product = productResponse.data

    const productUpdatedAt = new Date(product.updatedAt).getTime()
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
        error: 'Error verificando actualizaciones',
        hasUpdates: false,
      },
      { status: 500 }
    )
  }
}