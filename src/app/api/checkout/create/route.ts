import { type NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/modules/auth/server/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { cartId } = await request.json()

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 })
    }

    // Extraer solo el ID del carrito del GID completo
    const cartIdClean = cartId.split('/').pop()?.split('?')[0]

    if (!cartIdClean) {
      return NextResponse.json({ error: 'Invalid cart ID format' }, { status: 400 })
    }

    // Limpiar el storeDomain removiendo el protocolo
    let storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE || ''
    if (storeDomain.startsWith('https://')) {
      storeDomain = storeDomain.replace('https://', '')
    } else if (storeDomain.startsWith('http://')) {
      storeDomain = storeDomain.replace('http://', '')
    }

    // Construir URL de checkout estándar de Shopify
    const checkoutUrl = `https://${storeDomain}/cart/${cartIdClean}/checkout`

    return NextResponse.json({
      checkout: { webUrl: checkoutUrl },
      success: true,
    })
  } catch (error) {
    console.error('Error in checkout API:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
