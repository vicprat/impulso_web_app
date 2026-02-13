import { revalidateTag, unstable_cache } from 'next/cache'

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

  static readonly FULL_CATALOG_TAG = 'full-catalog'

  /**
   * Obtiene el catálogo completo de productos cacheado.
   * Se usa para búsquedas rápidas sin golpear la API de Shopify constantemente.
   */
  static async getFullCatalog() {
    return await unstable_cache(
      async () => {
        console.log('🔄 Cache MISS: Fetching full catalog from Shopify...')
        // Importación dinámica para evitar ciclos de dependencias si fuera necesario
        const { productService } = await import('@/services/product/service')

        // Obtener TODOS los productos (paginando internamente hasta terminar)
        // Usamos un límite alto por página para reducir requests
        let allProducts: any[] = []
        let hasNextPage = true
        let cursor = undefined

        while (hasNextPage) {
          const params = { cursor, limit: 250 }
          // Usamos getProductsPublic que ya retorna objetos Product serializables
          const response = await productService.getProductsPublic(params)

          allProducts = [...allProducts, ...response.products]

          hasNextPage = response.pageInfo.hasNextPage
          cursor = response.pageInfo.endCursor ?? undefined
        }

        console.log(`✅ Cached ${allProducts.length} products in fill catalog`)
        return allProducts
      },
      ['full-catalog-data'],
      {
        revalidate: 3600,
        tags: [this.FULL_CATALOG_TAG], // Revalidar al menos cada hora por seguridad
      }
    )()
  }

  static revalidateFullCatalog() {
    revalidateTag(this.FULL_CATALOG_TAG, 'max')
    console.log('🔄 Invalidated full catalog cache')
  }
}
