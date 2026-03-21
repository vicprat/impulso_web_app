import { revalidateTag } from 'next/cache'

// In-memory cache for the full product catalog
// This is more reliable than unstable_cache + revalidateTag which can be flaky in dev mode
interface CatalogCacheEntry {
  data: any[]
  fetchedAt: number
  fetchPromise?: Promise<any[]>
  version: number
}

const catalogCache = new Map<string, CatalogCacheEntry>()
const CATALOG_CACHE_TTL = 3600 * 1000 // 1 hour in ms

// Archivo para persistir la versión del cache (para consistencia cross-worker en dev)
const CACHE_VERSION_FILE = '.catalog-cache-version'

function getCacheVersion(): number {
  try {
    const { readFileSync, existsSync } = require('fs')
    if (existsSync(CACHE_VERSION_FILE)) {
      return parseInt(readFileSync(CACHE_VERSION_FILE, 'utf8').trim(), 10) || 0
    }
  } catch {
    // Ignorar errores
  }
  return 0
}

function setCacheVersion(version: number): void {
  try {
    const { writeFileSync } = require('fs')
    writeFileSync(CACHE_VERSION_FILE, version.toString(), 'utf8')
  } catch {
    // Ignorar errores
  }
}

// Registro global de caches en memoria para invalidación centralizada
interface SimpleCacheEntry {
  data: unknown
  fetchedAt: number
}
const globalCaches = new Map<string, Map<string, SimpleCacheEntry>>()

export function registerGlobalCache(name: string, cache: Map<string, SimpleCacheEntry>) {
  globalCaches.set(name, cache)
}

export function clearAllGlobalCaches() {
  for (const [name, cache] of globalCaches.entries()) {
    cache.clear()
    console.info(`🗑️ Cleared global cache: ${name}`)
  }
}

export class CacheManager {
  // Tags para productos
  static readonly PRODUCT_TAGS = {
    all: 'products',
    byHandle: (handle: string) => `product-handle-${handle}`,
    byId: (id: string) => `product-${id}`,
    byVendor: (vendor: string) => `products-vendor-${vendor}`,
  }

  // Tag específico para el full catalog (para revalidación cross-worker)
  static readonly FULL_CATALOG_TAG = 'full-catalog'

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

    // Return cached data if valid AND version matches (cache busting)
    if (entry && now - entry.fetchedAt < CATALOG_CACHE_TTL && entry.version === getCacheVersion()) {
      console.info(
        `✅ Cache HIT (${scope}): Returning cached data (${entry.data.length} products, version ${entry.version})`
      )
      return entry.data
    }

    // If there's already a fetch in progress for this scope, reuse it
    if (entry?.fetchPromise) {
      console.info(`⏳ Fetch in progress (${scope}): Reusing existing promise`)
      return entry.fetchPromise
    }

    // Fetch fresh data
    console.info(`🔄 Cache MISS (${scope}): Starting fresh fetch...`)
    const fetchPromise = this._fetchFullCatalog(scope)

    // Store the promise so concurrent requests reuse it
    catalogCache.set(cacheKey, {
      data: entry?.data ?? [],
      fetchPromise,
      fetchedAt: entry?.fetchedAt ?? 0,
      version: getCacheVersion(),
    })

    try {
      const data = await fetchPromise
      catalogCache.set(cacheKey, { data, fetchedAt: Date.now(), version: getCacheVersion() })
      console.info(`✅ Fetch complete (${scope}): Cached ${data.length} products`)
      return data
    } catch (error) {
      // On error, clear the promise so next request retries
      console.error(`❌ Fetch failed (${scope}):`, error)
      if (entry) {
        catalogCache.set(cacheKey, {
          data: entry.data,
          fetchedAt: entry.fetchedAt,
          version: entry.version,
        })
      } else {
        catalogCache.delete(cacheKey)
      }
      throw error
    }
  }

  private static async _fetchFullCatalog(scope: 'storefront' | 'admin'): Promise<any[]> {
    console.info(`🔄 Cache MISS (${scope}): Fetching full catalog from Shopify...`)

    // Usar GraphQL directo para evitar dependencia circular con getProductsPublic
    const { makeAdminApiRequest } = await import('@/lib/shopifyAdmin')

    const GET_ALL_PRODUCTS_QUERY = `
      query getAllProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              handle
              title
              vendor
              productType
              status
              tags
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price
                    sku
                    inventoryQuantity
                    inventoryPolicy
                    inventoryItem {
                      tracked
                    }
                  }
                }
              }
              metafields(first: 50, namespace: "art_details") {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `

    const allProducts: any[] = []
    let hasNextPage = true
    let cursor: string | undefined = undefined

    // Storefront: solo productos activos | Admin: todos los productos
    const includeInactive = scope === 'admin'

    while (hasNextPage) {
      const variables: Record<string, unknown> = { after: cursor, first: 250 }

      try {
        const response: {
          products: {
            edges: {
              node: {
                id: string
                handle: string
                title: string
                vendor: string
                productType: string
                status: string
                tags: string[]
                images: { edges: { node: { id: string; url: string; altText: string | null } }[] }
                variants: {
                  edges: {
                    node: {
                      id: string
                      title: string
                      availableForSale: boolean
                      price: { amount: string; currencyCode: string }
                      sku: string | null
                      inventoryQuantity: number | null
                      inventoryPolicy: string
                      inventoryItem: { tracked: boolean }
                    }
                  }[]
                }
                metafields: { edges: { node: { namespace: string; key: string; value: string } }[] }
              }
            }[]
            pageInfo: { hasNextPage: boolean; endCursor?: string }
          }
        } = await makeAdminApiRequest(GET_ALL_PRODUCTS_QUERY, variables)

        for (const edge of response.products.edges) {
          const node = edge.node

          // Definir tipo para las variantes
          interface VariantNode {
            node: {
              id: string
              title: string
              availableForSale: boolean
              price: string
              sku: string | null
              inventoryQuantity: number | null
              inventoryPolicy: string
              inventoryItem: { tracked: boolean }
            }
          }

          // Filtrar por status si es storefront
          if (!includeInactive && node.status !== 'ACTIVE') {
            continue
          }

          // Extraer metafields
          const metafields: Record<string, string> = {}
          for (const mf of node.metafields.edges) {
            metafields[mf.node.key] = mf.node.value
          }

          // Transformar imágenes
          const images = node.images.edges.map(
            (imgEdge: { node: { id: string; url: string; altText: string | null } }) => imgEdge.node
          )

          // Transformar variantes
          const variants = (node.variants.edges as unknown as VariantNode[]).map((vEdge) => ({
            availableForSale: vEdge.node.availableForSale,
            compareAtPrice: null,
            id: vEdge.node.id,
            inventoryManagement: vEdge.node.inventoryItem?.tracked ? 'SHOPIFY' : 'NOT_MANAGED',
            inventoryPolicy: vEdge.node.inventoryPolicy,
            inventoryQuantity: vEdge.node.inventoryQuantity,
            price: { amount: vEdge.node.price, currencyCode: 'MXN' },
            sku: vEdge.node.sku,
            title: vEdge.node.title,
          }))

          allProducts.push({
            artworkDetails: {
              artist: metafields.artist ?? node.vendor,
              depth: metafields.depth,
              height: metafields.height,
              location: metafields.location,
              medium: metafields.medium,
              serie: metafields.serie,
              width: metafields.width,
              year: metafields.year,
            },
            handle: node.handle,
            id: node.id,
            images,
            productType: node.productType,
            status: node.status,
            tags: node.tags,
            title: node.title,
            variants,
            vendor: node.vendor,
          })
        }

        hasNextPage = response.products.pageInfo.hasNextPage
        cursor = response.products.pageInfo.endCursor ?? undefined
      } catch (error) {
        console.error(`Error fetching products:`, error)
        throw error
      }
    }

    console.info(
      `✅ Fetched ${allProducts.length} products (scope: ${scope}). Converting to LightProduct for cache...`
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
          collections: [],
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
    const newVersion = getCacheVersion() + 1
    setCacheVersion(newVersion)
    console.info(`🔖 Revalidate catalog cache: Incremented version to ${newVersion}`)
  }

  static clearAllCaches() {
    this.revalidateFullCatalog()
    clearAllGlobalCaches()
    console.info('🗑️ Cleared ALL in-memory caches')
  }
}
