import { revalidateTag } from 'next/cache'

// In-memory cache for the full product catalog
// This is more reliable than unstable_cache + revalidateTag which can be flaky in dev mode
interface CatalogCacheEntry {
  data: any[]
  fetchedAt: number
  fetchPromise?: Promise<any[]>
}

const catalogCache = new Map<string, CatalogCacheEntry>()
const CATALOG_CACHE_TTL = 3600 * 1000 // 1 hour in ms

export class CacheManager {
  // Tags para productos
  static readonly PRODUCT_TAGS = {
    all: 'products',
    byHandle: (handle: string) => `product-handle-${handle}`,
    byId: (id: string) => `product-${id}`,
    byVendor: (vendor: string) => `products-vendor-${vendor}`,
  }

  // Tags para colecciones
  static readonly COLLECTION_TAGS = {
    all: 'collections',
    byHandle: (handle: string) => `collection-${handle}`,
  }

  // Tags para artistas
  static readonly ARTIST_TAGS = {
    all: 'artists',
    byId: (id: string) => `artist-${id}`,
  }

  // Tags para inventario
  static readonly INVENTORY_TAGS = {
    all: 'inventory',
    byProductId: (productId: string) => `inventory-${productId}`,
  }

  // Tags para página principal
  static readonly HOMEPAGE_TAGS = {
    all: 'homepage',
    featured: 'homepage-featured',
  }

  // Revalidar cache de productos
  static revalidateProducts(productId?: string, handle?: string, vendor?: string) {
    revalidateTag(this.PRODUCT_TAGS.all, 'max')

    if (productId) {
      revalidateTag(this.PRODUCT_TAGS.byId(productId), 'max')
    }

    if (handle) {
      revalidateTag(this.PRODUCT_TAGS.byHandle(handle), 'max')
    }

    if (vendor) {
      revalidateTag(this.PRODUCT_TAGS.byVendor(vendor), 'max')
    }
  }

  // Revalidar cache de inventario
  static revalidateInventory(productId?: string) {
    revalidateTag(this.INVENTORY_TAGS.all, 'max')

    if (productId) {
      revalidateTag(this.INVENTORY_TAGS.byProductId(productId), 'max')
    }
  }

  // Revalidar cache de artistas
  static revalidateArtists(artistId?: string) {
    revalidateTag(this.ARTIST_TAGS.all, 'max')

    if (artistId) {
      revalidateTag(this.ARTIST_TAGS.byId(artistId), 'max')
    }
  }

  // Revalidar cache de colecciones
  static revalidateCollections(handle?: string) {
    revalidateTag(this.COLLECTION_TAGS.all, 'max')

    if (handle) {
      revalidateTag(this.COLLECTION_TAGS.byHandle(handle), 'max')
    }
  }

  // Revalidar cache de página principal
  static revalidateHomepage() {
    revalidateTag(this.HOMEPAGE_TAGS.all, 'max')
    revalidateTag(this.HOMEPAGE_TAGS.featured, 'max')
  }

  // Revalidar todo el cache relacionado con un producto
  static revalidateProductCache(product: { id: string; handle: string; vendor?: string }) {
    this.revalidateProducts(product.id, product.handle, product.vendor)
    this.revalidateInventory(product.id)
    this.revalidateCollections()
    this.revalidateHomepage()
    this.revalidateFullCatalog()

    if (product.vendor) {
      this.revalidateArtists()
    }
  }

  // --- Full Catalog Cache for Search Optimization ---

  /**
   * Obtiene el catálogo completo de productos cacheado en memoria.
   * Se usa para búsquedas rápidas sin golpear la API de Shopify constantemente.
   * @param scope 'storefront' para versión super optimizada, 'admin' para versión con más datos
   */
  static async getFullCatalog(scope: 'storefront' | 'admin' = 'storefront'): Promise<any[]> {
    const cacheKey = `full-catalog-${scope}`
    const entry = catalogCache.get(cacheKey)
    const now = Date.now()

    // Return cached data if valid
    if (entry && now - entry.fetchedAt < CATALOG_CACHE_TTL) {
      return entry.data
    }

    // If there's already a fetch in progress for this scope, reuse it
    if (entry?.fetchPromise) {
      return entry.fetchPromise
    }

    // Fetch fresh data
    const fetchPromise = this._fetchFullCatalog(scope)

    // Store the promise so concurrent requests reuse it
    catalogCache.set(cacheKey, {
      data: entry?.data ?? [],
      fetchPromise,
      fetchedAt: entry?.fetchedAt ?? 0,
    })

    try {
      const data = await fetchPromise
      catalogCache.set(cacheKey, { data, fetchedAt: Date.now() })
      return data
    } catch (error) {
      // On error, clear the promise so next request retries
      if (entry) {
        catalogCache.set(cacheKey, { data: entry.data, fetchedAt: entry.fetchedAt })
      } else {
        catalogCache.delete(cacheKey)
      }
      throw error
    }
  }

  private static async _fetchFullCatalog(scope: 'storefront' | 'admin'): Promise<any[]> {
    console.info(`🔄 Cache MISS (${scope}): Fetching full catalog from Shopify...`)
    const { productService } = await import('@/services/product/service')

    let allProducts: any[] = []
    let hasNextPage = true
    let cursor = undefined

    while (hasNextPage) {
      const params = { cursor, limit: 250 }
      const response = await productService.getProductsPublic(params)

      allProducts = [...allProducts, ...response.products]

      hasNextPage = response.pageInfo.hasNextPage
      cursor = response.pageInfo.endCursor ?? undefined
    }

    console.info(
      `✅ Fetched ${allProducts.length} products. Converting to LightProduct (${scope}) for cache...`
    )

    // Optimización: Reducir tamaño del objeto para cache
    const lightProducts = allProducts.map((p: any) => {
      // Base: siempre eliminamos lo más pesado
      const base = {
        ...p,
        descriptionHtml: '', // Vaciar para ahorrar espacio (~50-80% del tamaño)
        media: [], // Vaciar arrays pesados no usados en cards
      }

      if (scope === 'storefront') {
        return {
          ...base,
          autoTags: [],
          collections: [],
          images: p.images && p.images.length > 0 ? [p.images[0]] : [],
          manualTags: [],
          variants: p.variants.map((v: any) => ({
            availableForSale: v.availableForSale,
            compareAtPrice: v.compareAtPrice,
            id: v.id,
            inventoryQuantity: v.inventoryQuantity,
            price: v.price,
            selectedOptions: v.selectedOptions,
            sku: v.sku,
            title: v.title,
          })),
        }
      } else {
        return {
          ...base,
          collections: p.collections,
          images: p.images,
          variants: p.variants.map((v: any) => ({
            ...v,
            inventoryManagement: v.inventoryManagement,
            inventoryPolicy: v.inventoryPolicy,
          })),
        }
      }
    })

    console.info(`✅ Cached ${lightProducts.length} products in full catalog (${scope})`)
    return lightProducts
  }

  static revalidateFullCatalog() {
    catalogCache.delete('full-catalog-storefront')
    catalogCache.delete('full-catalog-admin')
    console.info('🗑️ Cleared full catalog in-memory caches (storefront & admin)')
  }
}
