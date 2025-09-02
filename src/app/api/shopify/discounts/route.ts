import { type NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/src/modules/auth/server/server'
import { shopifyDiscountService } from '@/src/modules/shopify/discounts'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      appliesTo: searchParams.get('appliesTo') as
        | 'ALL_PRODUCTS'
        | 'SPECIFIC_PRODUCTS'
        | 'COLLECTIONS'
        | undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as 'PERCENTAGE' | 'FIXED_AMOUNT' | undefined,
    }

    const discounts = await shopifyDiscountService.getDiscounts()

    // Aplicar filtros
    let filteredDiscounts = discounts

    if (filters.isActive !== undefined) {
      filteredDiscounts = filteredDiscounts.filter((d) => d.isActive === filters.isActive)
    }

    if (filters.type) {
      filteredDiscounts = filteredDiscounts.filter((d) => d.type === filters.type)
    }

    if (filters.appliesTo) {
      filteredDiscounts = filteredDiscounts.filter((d) => d.appliesTo === filters.appliesTo)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredDiscounts = filteredDiscounts.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) || d.code.toLowerCase().includes(searchLower)
      )
    }
    return NextResponse.json(filteredDiscounts)
  } catch (error) {
    console.error('Error al obtener descuentos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar que los IDs de productos tengan el formato correcto
    if (body.productIds) {
      body.productIds = body.productIds.map((id: string) =>
        id.startsWith('gid://shopify/Product/')
          ? id
          : `gid://shopify/Product/${id.split('/').pop()}`
      )
    }

    const discount = await shopifyDiscountService.createDiscount(body)
    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error al crear descuento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
