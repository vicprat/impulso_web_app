import { NextResponse, type NextRequest } from 'next/server'

import { getServerSession } from '@/src/modules/auth/server/server'
import { shopifyDiscountService } from '@/src/modules/shopify/discounts'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const discount = await shopifyDiscountService.getDiscount(id)

    if (!discount) {
      return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error al obtener descuento:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    console.log('🔍 DEBUG - PATCH endpoint recibido:', { id, body })

    // Si se está actualizando isActive, usar el método separado
    if (body.isActive !== undefined) {
      console.log('🔍 DEBUG - Cambiando estado isActive:', body.isActive)
      await shopifyDiscountService.toggleDiscountStatus(id, body.isActive)
      // Remover isActive del body para la actualización normal
      delete body.isActive
    }

    // Actualizar otros campos si hay alguno (excluyendo endsAt si se cambió isActive)
    if (Object.keys(body).length > 0) {
      console.log('🔍 DEBUG - Actualizando otros campos:', body)
      const discount = await shopifyDiscountService.updateDiscount({
        id,
        ...body,
      })
      return NextResponse.json(discount)
    }

    // Si solo se actualizó isActive, devolver el descuento actualizado
    console.log('🔍 DEBUG - Solo se cambió isActive, obteniendo descuento actualizado')
    const discount = await shopifyDiscountService.getDiscount(id)
    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error al actualizar descuento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    await shopifyDiscountService.deleteDiscount(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar descuento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
