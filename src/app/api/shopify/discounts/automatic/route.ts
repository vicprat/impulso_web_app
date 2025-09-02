import { type NextRequest, NextResponse } from 'next/server'

import { shopifyDiscountService } from '@/modules/shopify/discounts'
import { getServerSession } from '@/src/modules/auth/server/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { endsAt, productIds, startsAt, title, type, value } = body

    // Validaciones
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'productIds es requerido y debe ser un array no vacío' },
        { status: 400 }
      )
    }

    if (!type || !['PERCENTAGE', 'FIXED_AMOUNT'].includes(type)) {
      return NextResponse.json(
        { error: 'type debe ser PERCENTAGE o FIXED_AMOUNT' },
        { status: 400 }
      )
    }

    if (!value || value <= 0) {
      return NextResponse.json({ error: 'value debe ser mayor a 0' }, { status: 400 })
    }

    console.log('🔍 DEBUG - Creando descuento automático:', { productIds, title, type, value })

    const discount = await shopifyDiscountService.createAutomaticProductDiscount({
      endsAt,
      productIds,
      startsAt,
      title,
      type,
      value,
    })

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error al crear descuento automático:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
