import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { CacheManager, registerGlobalCache } from '@/lib/cache'
import { requirePermission } from '@/src/modules/auth/server/server'

// Cache simple para product-metrics
interface CacheEntry {
  data: unknown
  fetchedAt: number
}
const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Registrar cache para invalidación centralizada
registerGlobalCache('dashboard-product-metrics', cache)

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.VIEW_ANALYTICS)

    // Verificar cache
    const cacheKey = 'product-metrics'
    const cached = cache.get(cacheKey)
    const now = Date.now()
    if (cached && now - cached.fetchedAt < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Usar CacheManager para obtener productos - evita llamadas duplicadas a Shopify
    const products = await CacheManager.getFullCatalog('admin')

    const data = {
      activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
      archivedProducts: products.filter((p) => p.status === 'ARCHIVED').length,
      averagePrice:
        products.length > 0
          ? products.reduce(
              (sum: number, p: any) => sum + parseFloat(p.primaryVariant?.price?.amount ?? '0'),
              0
            ) / products.length
          : 0,
      draftProducts: products.filter((p) => p.status === 'DRAFT').length,
      productsByArtist: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const artist = product.vendor ?? 'Sin artista'
          acc[artist] = (acc[artist] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      productsByCategory: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const category = product.productType ?? 'Sin categoría'
          acc[category] = (acc[category] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),

      productsByLocation: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const location = product.artworkDetails?.location || 'Sin ubicación especificada'
          acc[location] = (acc[location] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),

      productsByMedium: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const medium = product.artworkDetails?.medium || 'Sin medio especificado'
          acc[medium] = (acc[medium] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),

      productsBySerie: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const serie = product.artworkDetails?.serie || 'Sin serie especificada'
          acc[serie] = (acc[serie] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),

      productsByYear: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const year = product.artworkDetails?.year || 'Sin año especificado'
          acc[year] = (acc[year] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),

      // Información detallada de productos
      productsDetails: products.map((product) => ({
        artworkDetails: product.artworkDetails,
        autoTags: product.autoTags,
        id: product.id,
        isAvailable: product.isAvailable,
        manualTags: product.manualTags,
        price: product.formattedPrice,
        productType: product.productType,
        status: product.status,
        tags: product.tags,
        title: product.title,
        vendor: product.vendor,
      })),

      // Métricas enriquecidas con datos de artwork
      productsWithArtworkDetails: products.filter(
        (p) => p.artworkDetails && Object.values(p.artworkDetails).some((value) => value !== null)
      ).length,

      totalInventoryValue: products.reduce((sum: number, p: any) => {
        const price = parseFloat(p.primaryVariant?.price?.amount ?? '0')
        const quantity = p.primaryVariant?.inventoryQuantity ?? 0
        return sum + price * quantity
      }, 0),

      totalProducts: products.length,
    }

    // Guardar en cache
    cache.set(cacheKey, { data, fetchedAt: now })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching product metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
