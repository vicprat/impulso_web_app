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

    const inventoryItem = JSON.parse(body)
    const inventoryItemId = inventoryItem.inventory_item_id

    if (!inventoryItemId) {
      return NextResponse.json({ error: 'Inventory item ID not found' }, { status: 400 })
    }

    // Obtener el producto asociado al inventory item desde Shopify
    let productId: string | null = null
    try {
      let storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE || ''
      storeDomain = storeDomain.replace('https://', '').replace('http://', '')
      const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION
      const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
      
      const inventoryResponse = await fetch(
        `https://${storeDomain}/admin/api/${apiVersion}/inventory_items/${inventoryItemId}.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken!,
          },
        }
      )

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        productId = inventoryData.inventory_item.product_id?.toString()
      }
    } catch (error) {
      // Silenciar errores de red
    }

    if (!productId) {
      return NextResponse.json({
        available: inventoryItem.available,
        inventoryItemId,
        message: 'Inventory webhook processed (no product ID found)',
        note: 'Product ID not found - this is normal for products without inventory',
        success: true,
      })
    }

    // Revalidar cache usando CacheManager
    CacheManager.revalidateProducts(productId)
    CacheManager.revalidateInventory(productId)
    CacheManager.revalidateCollections()
    CacheManager.revalidateHomepage()

    // Revalidar rutas que muestran productos y eventos
    revalidatePath('/store', 'page')
    revalidatePath('/store/product/[handle]', 'page')
    revalidatePath('/store/event/[handle]', 'page')
    revalidatePath('/store/events', 'page')
    revalidatePath('/', 'page')

    return NextResponse.json({
      available: inventoryItem.available,
      inventoryItemId: inventoryItem.id,
      message: 'Inventory webhook processed successfully',
      productId,
      revalidatedPaths: [
        '/store',
        '/store/product/[handle]',
        '/store/event/[handle]',
        '/store/events',
        '/'
      ],
      revalidatedTags: [
        'products',
        `product-${productId}`,
        'inventory',
        'collections',
        'homepage'
      ],
      success: true,
    })
  } catch (error) {
    console.error('❌ Error en webhook de inventario:', error)

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
    message: 'Shopify inventory webhook endpoint is active',
    supportedTypes: ['inventory_levels'],
    timestamp: new Date().toISOString(),
  })
} 