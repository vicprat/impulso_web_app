import { existsSync, promises as fs } from 'fs'
import path from 'path'

import { revalidateTag } from 'next/cache'

interface CatalogCacheEntry {
  data: any[]
  fetchedAt: number
  fetchPromise?: Promise<any[]>
  version: number
}

const catalogCache = new Map<string, CatalogCacheEntry>()
const CATALOG_CACHE_TTL = 24 * 3600 * 1000
const REQUEST_DELAY_MS = 500
const MAX_RETRY_ATTEMPTS = 5
const RETRY_DELAY_BASE_MS = 2000
const THROTTLED_DELAY_BASE_MS = 5000

const isProduction =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
const CACHE_DIR = isProduction ? '/tmp/cache' : path.join(process.cwd(), '.cache')
const CACHE_DATA_FILE = path.join(CACHE_DIR, 'catalog-cache.json')

async function ensureCacheDir() {
  try {
    if (!existsSync(CACHE_DIR)) {
      await fs.mkdir(CACHE_DIR, { recursive: true })
    }
  } catch (error) {
    console.warn('⚠️ Could not create cache directory, using memory-only cache:', error)
  }
}

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

async function getCacheVersion(scope: string): Promise<number> {
  try {
    const versionFile = path.join(CACHE_DIR, `catalog-cache-version-${scope}.json`)
    if (existsSync(versionFile)) {
      const content = await fs.readFile(versionFile, 'utf8')
      return parseInt(content, 10) || 0
    }
    return 0
  } catch {
    return 0
  }
}

async function setCacheVersion(scope: string, version: number): Promise<void> {
  const scopeFile = path.join(CACHE_DIR, `catalog-cache-version-${scope}.json`)
  await fs.writeFile(scopeFile, version.toString(), 'utf8')
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
  static readonly PRODUCT_TAGS = {
    all: 'products',
    byHandle: (handle: string) => `product-handle-${handle}`,
    byId: (id: string) => `product-${id}`,
    byVendor: (vendor: string) => `products-vendor-${vendor}`,
  }

  static readonly FULL_CATALOG_TAG = 'full-catalog'

  static readonly COLLECTION_TAGS = {
    all: 'collections',
    byHandle: (handle: string) => `collection-${handle}`,
  }

  static readonly ARTIST_TAGS = {
    all: 'artists',
    byId: (id: string) => `artist-${id}`,
  }

  static readonly INVENTORY_TAGS = {
    all: 'inventory',
    byProductId: (productId: string) => `inventory-${productId}`,
  }

  static readonly HOMEPAGE_TAGS = {
    all: 'homepage',
    featured: 'homepage-featured',
  }

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

  static revalidateInventory(productId?: string) {
    revalidateTag(this.INVENTORY_TAGS.all, 'max')

    if (productId) {
      revalidateTag(this.INVENTORY_TAGS.byProductId(productId), 'max')
    }
  }

  static revalidateArtists(artistId?: string) {
    revalidateTag(this.ARTIST_TAGS.all, 'max')

    if (artistId) {
      revalidateTag(this.ARTIST_TAGS.byId(artistId), 'max')
    }
  }

  static revalidateCollections(handle?: string) {
    revalidateTag(this.COLLECTION_TAGS.all, 'max')

    if (handle) {
      revalidateTag(this.COLLECTION_TAGS.byHandle(handle), 'max')
    }
  }

  static revalidateHomepage() {
    revalidateTag(this.HOMEPAGE_TAGS.all, 'max')
    revalidateTag(this.HOMEPAGE_TAGS.featured, 'max')
  }

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

  static async getFullCatalog(scope: 'storefront' | 'admin' = 'storefront'): Promise<any[]> {
    const cacheKey = `full-catalog-${scope}`
    const entry = catalogCache.get(cacheKey)
    const now = Date.now()
    const currentVersion = await getCacheVersion(scope)

    if (entry && now - entry.fetchedAt < CATALOG_CACHE_TTL && entry.version === currentVersion) {
      console.info(
        `✅ Memory Cache HIT (${scope}): Returning cached data (${entry.data.length} products, version ${entry.version})`
      )
      return entry.data
    }

    if (entry?.fetchPromise) {
      console.info(`⏳ Fetch in progress (${scope}): Reusing existing promise`)
      return entry.fetchPromise
    }

    if (entry?.version !== currentVersion) {
      const fileCache = await loadCatalogFromFile(scope)
      if (fileCache?.version === currentVersion) {
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

    console.info(`🔄 Cache MISS (${scope}): Starting fresh fetch...`)
    const fetchPromise = this._fetchFullCatalog(scope, currentVersion)

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
      console.error(`❌ Fetch failed (${scope}):`, error)
      if (entry && entry.data.length > 0) {
        console.warn(`⚠️ Returning stale cache data (${entry.data.length} products)`)
        return entry.data
      } else {
        catalogCache.delete(cacheKey)
        throw error
      }
    }
  }

  private static async _fetchFullCatalog(
    scope: 'storefront' | 'admin',
    expectedVersion?: number
  ): Promise<any[]> {
    const fileCache = await loadCatalogFromFile(scope)
    if (fileCache && (!expectedVersion || fileCache.version === expectedVersion)) {
      return fileCache.data
    }

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
              artistMetafield: metafield(namespace: "art_details", key: "artist") { value }
              mediumMetafield: metafield(namespace: "art_details", key: "medium") { value }
              yearMetafield: metafield(namespace: "art_details", key: "year") { value }
              widthMetafield: metafield(namespace: "art_details", key: "width") { value }
              heightMetafield: metafield(namespace: "art_details", key: "height") { value }
              depthMetafield: metafield(namespace: "art_details", key: "depth") { value }
              locationMetafield: metafield(namespace: "art_details", key: "location") { value }
              serieMetafield: metafield(namespace: "art_details", key: "serie") { value }
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

    const includeInactive = scope === 'admin'

    while (hasNextPage) {
      pageCount++
      const variables: Record<string, unknown> = { after: cursor, first: 100 }

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
                  artistMetafield: { value: string | null } | null
                  mediumMetafield: { value: string | null } | null
                  yearMetafield: { value: string | null } | null
                  widthMetafield: { value: string | null } | null
                  heightMetafield: { value: string | null } | null
                  depthMetafield: { value: string | null } | null
                  locationMetafield: { value: string | null } | null
                  serieMetafield: { value: string | null } | null
                }
              }[]
              pageInfo: { hasNextPage: boolean; endCursor?: string }
            }
          } = await makeAdminApiRequest(GET_ALL_PRODUCTS_QUERY, variables)

          for (const edge of response.products.edges) {
            const node = edge.node

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

            if (!includeInactive && node.status !== 'ACTIVE') {
              continue
            }

            const metafields: Record<string, string> = {
              artist: node.artistMetafield?.value ?? '',
              depth: node.depthMetafield?.value ?? '',
              height: node.heightMetafield?.value ?? '',
              location: node.locationMetafield?.value ?? '',
              medium: node.mediumMetafield?.value ?? '',
              serie: node.serieMetafield?.value ?? '',
              width: node.widthMetafield?.value ?? '',
              year: node.yearMetafield?.value ?? '',
            }

            const images = node.images.edges.map(
              (imgEdge: { node: { id: string; url: string; altText: string | null } }) =>
                imgEdge.node
            )

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

          const errorMessage = typeof error.message === 'string' ? error.message : ''
          const graphQLErrors = error.graphQLErrors || []
          const isThrottled =
            errorMessage.includes('Throttled') ||
            errorMessage.includes('Rate limit') ||
            errorMessage.includes('THROTTLED') ||
            graphQLErrors.some((e: any) => e?.message?.includes('Throttled')) ||
            graphQLErrors.some((e: any) => e?.extensions?.code === 'THROTTLED') ||
            error.status === 429

          if (isThrottled && retryAttempt < MAX_RETRY_ATTEMPTS) {
            const throttledError = graphQLErrors.find(
              (e: any) => e?.message?.includes('Throttled') || e?.extensions?.code === 'THROTTLED'
            )
            const retryAfterSeconds = throttledError?.extensions?.retryAfter ?? 2
            const retryDelay = Math.max(
              retryAfterSeconds * 1000,
              THROTTLED_DELAY_BASE_MS * Math.pow(2, retryAttempt - 1)
            )
            console.warn(
              `⚠️ Shopify throttling detected (page ${pageCount}). Retrying in ${retryDelay}ms... (attempt ${retryAttempt}/${MAX_RETRY_ATTEMPTS})`
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

      if (pageCount % 10 === 0) {
        console.info(`📊 Progress: ${allProducts.length} products fetched (${pageCount} pages)`)
      }
    }

    console.info(`✅ Fetched ${allProducts.length} products in ${pageCount} pages`)

    console.info(
      `✅ Fetched ${allProducts.length} products (scope: ${scope}). Converting to LightProduct for cache...`
    )

    const lightProducts = allProducts.map((p: any) => {
      const base = {
        ...p,
        descriptionHtml: '',
        media: [],
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

    const finalVersion = await getCacheVersion(scope)
    await saveCatalogToFile(scope, lightProducts, finalVersion)

    return lightProducts
  }

  static async revalidateFullCatalog(scope?: 'storefront' | 'admin') {
    if (scope) {
      const currentVersion = await getCacheVersion(scope)
      const newVersion = currentVersion + 1
      await setCacheVersion(scope, newVersion)
      catalogCache.delete(`full-catalog-${scope}`)
    } else {
      const scopes: ('storefront' | 'admin')[] = ['storefront', 'admin']
      for (const s of scopes) {
        const currentVersion = await getCacheVersion(s)
        const newVersion = currentVersion + 1
        await setCacheVersion(s, newVersion)
        catalogCache.delete(`full-catalog-${s}`)
      }
    }
  }

  static async clearAllCaches() {
    await this.revalidateFullCatalog()
    clearAllGlobalCaches()
    console.info('🗑️ Cleared ALL in-memory caches')
  }
}
