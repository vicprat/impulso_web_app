import { existsSync, promises as fs } from 'fs'
import path from 'path'

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
const CATALOG_CACHE_TTL = 24 * 3600 * 1000 // 24 hours in ms
const REQUEST_DELAY_MS = 200 // Delay entre llamadas a Shopify
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_BASE_MS = 1000

// Directorio de caché: usar /tmp en producción (Vercel/AWS Lambda), .cache local en dev
// Detectamos producción por VERCEL_ENV o si process.cwd() no es escribible
const isProduction =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
const CACHE_DIR = isProduction ? '/tmp/cache' : path.join(process.cwd(), '.cache')
const CACHE_DATA_FILE = path.join(CACHE_DIR, 'catalog-cache.json')

// Asegurar que existe el directorio de cache
async function ensureCacheDir() {
  try {
    if (!existsSync(CACHE_DIR)) {
      await fs.mkdir(CACHE_DIR, { recursive: true })
    }
  } catch (error) {
    console.warn('⚠️ Could not create cache directory, using memory-only cache:', error)
  }
}

// Guardar catálogo en archivo (separado por scope)
async function saveCatalogToFile(scope: string, data: any[], version: number) {
  try {
    await ensureCacheDir()
    const scopeFile = CACHE_DATA_FILE.replace('.json', `-${scope}.json`)
    const cacheData = {
      data,
      fetchedAt: Date.now(),
      scope,
      version,
    }
    await fs.writeFile(scopeFile, JSON.stringify(cacheData), 'utf8')
    console.info(`💾 Saved ${scope} catalog to file: ${data.length} products`)
  } catch (error) {
    console.error('Error saving catalog to file:', error)
  }
}

// Cargar catálogo desde archivo (por scope)
async function loadCatalogFromFile(
  scope: string
): Promise<{ data: any[]; version: number } | null> {
  try {
    const scopeFile = CACHE_DATA_FILE.replace('.json', `-${scope}.json`)
    if (!existsSync(scopeFile)) {
      return null
    }

    const content = await fs.readFile(scopeFile, 'utf8')
    const cacheData = JSON.parse(content)

    const age = Date.now() - cacheData.fetchedAt
    if (age > CATALOG_CACHE_TTL) {
      console.info(`📄 ${scope} file cache expired (${Math.round(age / 1000)}s old)`)
      return null
    }

    console.info(`📄 Loaded ${scope} catalog from file: ${cacheData.data.length} products`)
    return { data: cacheData.data, version: cacheData.version }
  } catch (error) {
    console.error('Error loading catalog from file:', error)
    return null
  }
}

// Cada scope tiene su propia versión, leída desde su archivo de caché
async function getCacheVersion(scope: string): Promise<number> {
  try {
    const cache = await loadCatalogFromFile(scope)
    return cache?.version ?? 0
  } catch {
    return 0
  }
}

async function setCacheVersion(scope: string, version: number): Promise<void> {
  try {
    const scopeFile = path.join(CACHE_DIR, `catalog-cache-version-${scope}.json`)
    await fs.writeFile(scopeFile, version.toString(), 'utf8')
  } catch {
    // Ignorar errores de escritura (serverless sin permisos)
  }
}

// Utility function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
    const currentVersion = await getCacheVersion(scope)

    // Return cached data if valid AND version matches (cache busting)
    if (entry && now - entry.fetchedAt < CATALOG_CACHE_TTL && entry.version === currentVersion) {
      console.info(
        `✅ Memory Cache HIT (${scope}): Returning cached data (${entry.data.length} products, version ${entry.version})`
      )
      return entry.data
    }

    // If there's already a fetch in progress for this scope, reuse it
    if (entry?.fetchPromise) {
      console.info(`⏳ Fetch in progress (${scope}): Reusing existing promise`)
      return entry.fetchPromise
    }

    // CRÍTICO: En serverless (Vercel), el caché en memoria se pierde entre requests
    // Intentar cargar desde archivo PRIMERO si no hay en memoria
    if (!entry || entry.version !== currentVersion) {
      const fileCache = await loadCatalogFromFile(scope)
      if (fileCache && fileCache.version === currentVersion) {
        console.info(
          `✅ File Cache HIT (${scope}): Loaded ${fileCache.data.length} products from file (serverless recovery)`
        )
        catalogCache.set(cacheKey, {
          data: fileCache.data,
          fetchedAt: Date.now(),
          version: currentVersion,
        })
        return fileCache.data
      }
    }

    // Fetch fresh data
    console.info(`🔄 Cache MISS (${scope}): Starting fresh fetch...`)
    const fetchPromise = this._fetchFullCatalog(scope)

    // Store the promise so concurrent requests reuse it
    catalogCache.set(cacheKey, {
      data: entry?.data ?? [],
      fetchPromise,
      fetchedAt: entry?.fetchedAt ?? 0,
      version: currentVersion,
    })

    try {
      const data = await fetchPromise
      catalogCache.set(cacheKey, { data, fetchedAt: Date.now(), version: currentVersion })
      console.info(`✅ Fetch complete (${scope}): Cached ${data.length} products`)
      return data
    } catch (error) {
      // On error, clear the promise so next request retries
      console.error(`❌ Fetch failed (${scope}):`, error)
      if (entry && entry.data.length > 0) {
        // Si hay datos antiguos en cache, devolverlos como fallback
        console.warn(`⚠️ Returning stale cache data (${entry.data.length} products)`)
        return entry.data
      } else {
        catalogCache.delete(cacheKey)
        throw error
      }
    }
  }

  private static async _fetchFullCatalog(scope: 'storefront' | 'admin'): Promise<any[]> {
    console.info(`🔄 Cache MISS (${scope}): Fetching full catalog from Shopify...`)

    // Intentar cargar desde archivo primero
    const fileCache = await loadCatalogFromFile(scope)
    if (fileCache) {
      console.info(`✅ Using file cache for ${scope}`)
      return fileCache.data
    }

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
    let consecutiveErrors = 0
    let pageCount = 0

    // Storefront: solo productos activos | Admin: todos los productos
    const includeInactive = scope === 'admin'

    while (hasNextPage) {
      pageCount++
      const variables: Record<string, unknown> = { after: cursor, first: 250 }

      // Rate limiting: delay entre llamadas (excepto la primera)
      if (pageCount > 1) {
        await delay(REQUEST_DELAY_MS)
      }

      let retryAttempt = 0
      let success = false

      while (!success && retryAttempt < MAX_RETRY_ATTEMPTS) {
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
                  metafields: {
                    edges: { node: { namespace: string; key: string; value: string } }[]
                  }
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
              (imgEdge: { node: { id: string; url: string; altText: string | null } }) =>
                imgEdge.node
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
          consecutiveErrors = 0
          success = true
        } catch (error: any) {
          consecutiveErrors++
          retryAttempt++

          // Detectar throttling de Shopify
          const isThrottled =
            error.message?.includes('Throttled') ||
            error.message?.includes('Rate limit') ||
            error.status === 429

          if (isThrottled) {
            const retryDelay = RETRY_DELAY_BASE_MS * Math.pow(2, retryAttempt)
            console.warn(
              `⚠️ Shopify throttling detected. Retrying in ${retryDelay}ms... (attempt ${retryAttempt}/${MAX_RETRY_ATTEMPTS})`
            )
            await delay(retryDelay)
          } else if (retryAttempt < MAX_RETRY_ATTEMPTS) {
            const retryDelay = RETRY_DELAY_BASE_MS * retryAttempt
            console.warn(
              `⚠️ Error fetching page ${pageCount}. Retrying in ${retryDelay}ms... (attempt ${retryAttempt}/${MAX_RETRY_ATTEMPTS})`
            )
            await delay(retryDelay)
          } else {
            console.error(
              `❌ Failed to fetch page ${pageCount} after ${MAX_RETRY_ATTEMPTS} attempts`
            )
            throw error
          }
        }
      }

      // Log progreso cada 10 páginas
      if (pageCount % 10 === 0) {
        console.info(`📊 Progress: ${allProducts.length} products fetched (${pageCount} pages)`)
      }
    }

    console.info(`✅ Fetched ${allProducts.length} products in ${pageCount} pages`)

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

    // Guardar en archivo para persistencia
    const currentVersion = await getCacheVersion(scope)
    await saveCatalogToFile(scope, lightProducts, currentVersion)

    return lightProducts
  }

  static async revalidateFullCatalog(scope?: 'storefront' | 'admin') {
    if (scope) {
      // Invalidar solo un scope específico
      const currentVersion = await getCacheVersion(scope)
      const newVersion = currentVersion + 1
      await setCacheVersion(scope, newVersion)
      console.info(`🔖 Revalidate ${scope} catalog cache: Incremented version to ${newVersion}`)
    } else {
      // Invalidar todos los scopes
      const scopes: ('storefront' | 'admin')[] = ['storefront', 'admin']
      for (const s of scopes) {
        const currentVersion = await getCacheVersion(s)
        const newVersion = currentVersion + 1
        await setCacheVersion(s, newVersion)
        console.info(`🔖 Revalidate ${s} catalog cache: Incremented version to ${newVersion}`)
      }
    }
  }

  static async clearAllCaches() {
    await this.revalidateFullCatalog()
    clearAllGlobalCaches()
    console.info('🗑️ Cleared ALL in-memory caches')
  }
}
