import crypto from 'crypto'

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { CacheManager } from '@/lib/cache'

function verifyShopifyWebhook(body: string, signature: string): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET

  if (!webhookSecret) {
    return process.env.NODE_ENV !== 'production'
  }

  // Método 1: Verificación estándar
  const hmac = crypto.createHmac('sha256', webhookSecret)
  hmac.update(body, 'utf8')
  const hash = hmac.digest('base64')

  // Método 2: Verificación alternativa (por si Shopify usa un encoding diferente)
  const hmac2 = crypto.createHmac('sha256', webhookSecret)
  hmac2.update(Buffer.from(body))
  const hash2 = hmac2.digest('base64')

  // Si estamos en desarrollo y ninguna funciona, permitir
  if (process.env.NODE_ENV !== 'production' && hash !== signature && hash2 !== signature) {
    return true
  }

  return hash === signature || hash2 === signature
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verificar autenticidad del webhook
    const isValid = verifyShopifyWebhook(body, signature)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const product = JSON.parse(body)
    const productHandle = product.handle
    const isEvent = product.vendor === 'Evento'

    if (!productHandle) {
      return NextResponse.json({ error: 'Product handle not found' }, { status: 400 })
    }

    // Revalidar cache usando CacheManager
    CacheManager.revalidateProductCache({
      handle: productHandle,
      id: product.id,
      vendor: product.vendor,
    })

    // Revalidación ya manejada por CacheManager arriba

    // Revalidar rutas específicas según el tipo
    if (isEvent) {
      // Para eventos
      const eventPath = `/store/event/${productHandle}`
      revalidatePath(eventPath, 'page')
      revalidatePath('/store/events', 'page')
      revalidatePath('/store/event/[handle]', 'page')
    } else {
      // Para productos normales
      const productPath = `/store/product/${productHandle}`
      revalidatePath(productPath, 'page')
      revalidatePath('/store/product/[handle]', 'page')
    }

    // Revalidar rutas comunes
    revalidatePath('/store', 'page')
    revalidatePath('/', 'page')

    // Revalidar rutas de artistas si el producto tiene vendor (no eventos)
    if (product.vendor && !isEvent) {
      revalidatePath('/artists', 'page')
    }

    return NextResponse.json({
      message: 'Product webhook processed successfully',
      productHandle,
      productId: product.id,
      productType: isEvent ? 'event' : 'product',
      revalidatedPaths: isEvent
        ? [`/store/event/${productHandle}`, '/store/events', '/store/event/[handle]', '/store', '/']
        : [
            `/store/product/${productHandle}`,
            '/store/product/[handle]',
            '/store',
            '/',
            ...(product.vendor && !isEvent ? ['/artists'] : []),
          ],
      success: true,
      vendor: product.vendor,
    })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)

    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasWebhookSecret: !!process.env.SHOPIFY_WEBHOOK_SECRET,
    message: 'Shopify products webhook endpoint is active',
    supportedTypes: ['products', 'events'],
    timestamp: new Date().toISOString(),
  })
}
