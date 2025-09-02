import { NextResponse, type NextRequest } from 'next/server'

import { getServerSession } from '@/src/modules/auth/server/server'
import { shopifyDiscountService } from '@/src/modules/shopify/discounts'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { endsAt, minimumQuantity, productIds, startsAt, title, type, value } = body

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

    if (!minimumQuantity || minimumQuantity < 2) {
      return NextResponse.json({ error: 'minimumQuantity debe ser al menos 2' }, { status: 400 })
    }

    console.log('🔍 DEBUG - Creando descuento por volumen:', {
      minimumQuantity,
      productIds,
      title,
      type,
      value,
    })

    const discount = await shopifyDiscountService.createVolumeDiscount({
      endsAt,
      minimumQuantity,
      productIds,
      startsAt,
      title,
      type,
      value,
    })

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error al crear descuento por volumen:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
