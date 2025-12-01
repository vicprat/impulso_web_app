import {
  calculateDimensionValue,
  categorizeDimensions,
  formatDimensions,
} from '@/helpers/dimensions'
import { buildProductSearchQuery, normalizeText } from '@/helpers/search'
import { prisma } from '@/lib/prisma'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { Product } from '@/models/Product'
import { type AuthSession } from '@/modules/auth/service'

import { locationTrackingService } from './location-tracking'
import {
  CREATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  GET_INVENTORY_ITEM_QUERY,
  GET_PRODUCTS_QUERY,
  GET_PUBLICATIONS_QUERY,
  GET_SINGLE_PRODUCT_QUERY,
  INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
  PRODUCT_CREATE_MEDIA_MUTATION,
  PRODUCT_DELETE_MEDIA_MUTATION,
  PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
  PUBLISH_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
} from './queries'
import {
  type CreateProductPayload,
  type DeleteMutationResponse,
  type GetInventoryItemResponse,
  type GetProductsApiResponse,
  type GetProductsParams,
  type GetPublicationsApiResponse,
  type InventorySetOnHandQuantitiesResponse,
  type PaginatedProductsResponse,
  type ProductCreateMediaResponse,
  type ProductMutationResponse,
  type ShopifyProductData,
  type ShopifyUserError,
  type UpdateProductPayload,
} from './types'

type ValidatedSession = NonNullable<AuthSession>

interface ProductVariantsBulkUpdateResponse {
  productVariantsBulkUpdate: {
    productVariants: { id: string }[]
    userErrors: ShopifyUserError[]
  }
}

let primaryLocationId: string | null = null

function validateSession(session: AuthSession): asserts session is ValidatedSession {
  if (!session.user.id) {
    throw new Error('Sesión no válida o usuario no autenticado.')
  }
}

function filterProductsByExactSearch(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm?.trim()) return products

  const normalizedSearch = normalizeText(searchTerm)
  const searchWords = normalizedSearch.split(/\s+/).filter((word) => word.length >= 1)

  if (searchWords.length === 0) {
    return products
  }

  return products.filter((product) => {
    const productId = product.id.split('/').pop() ?? product.id
    const searchableText = normalizeText(
      [
        productId,
        product.title,
        product.vendor,
        product.productType,
        product.artworkDetails.medium,
        product.artworkDetails.location,
        product.artworkDetails.serie,
        ...product.tags,
      ]
        .filter(Boolean)
        .join(' ')
    )

    // Para búsquedas de una palabra, buscar si contiene la palabra
    // Para búsquedas de múltiples palabras, todas deben estar presentes
    if (searchWords.length === 1) {
      return searchableText.includes(searchWords[0])
    } else {
      return searchWords.every((word) => searchableText.includes(word))
    }
  })
}

export async function getPrimaryLocationId(): Promise<string> {
  if (primaryLocationId) return primaryLocationId

  const response = await makeAdminApiRequest<{ locations: { edges: { node: { id: string } }[] } }>(
    `query { locations(first: 1, query: "is_active:true") { edges { node { id name } } } }`,
    {}
  )

  const locationId = response.locations.edges[0]?.node?.id
  if (!locationId) {
    throw new Error('No se pudo encontrar una ubicación de Shopify para gestionar el inventario.')
  }

  primaryLocationId = locationId
  return primaryLocationId
}

async function getProducts(
  params: GetProductsParams,
  session?: AuthSession
): Promise<PaginatedProductsResponse> {
  if (session) {
    validateSession(session)
  }

  let shopifyQuery = ''

  if (params.search?.trim()) {
    shopifyQuery = buildProductSearchQuery(params.search)
  }

  // Usar el vendor del parámetro (ya establecido en getProductsFromRequest para artistas)
  if (params.vendor?.trim()) {
    if (shopifyQuery) {
      shopifyQuery += ` AND vendor:"${params.vendor}"`
    } else {
      shopifyQuery = `vendor:"${params.vendor}"`
    }
  }

  if (params.status?.trim()) {
    if (shopifyQuery) {
      shopifyQuery += ` AND status:${params.status}`
    } else {
      shopifyQuery = `status:${params.status}`
    }
  }

  if (params.artworkType?.trim()) {
    if (shopifyQuery) {
      shopifyQuery += ` AND product_type:"${params.artworkType}"`
    } else {
      shopifyQuery = `product_type:"${params.artworkType}"`
    }
  }

  const hasMetafieldFilters =
    params.technique?.trim() ?? params.dimensions?.trim() ?? params.year?.trim()

  let sortKey = 'TITLE' // Default sort key
  let reverse = false // Default sort order
  let useManualSorting = false // Flag para usar sorting manual
  let manualSortField = '' // Campo para sorting manual

  if (params.sortBy) {
    switch (params.sortBy) {
      case 'title':
        sortKey = 'TITLE'
        break
      case 'vendor':
        sortKey = 'VENDOR'
        break
      case 'productType':
        sortKey = 'PRODUCT_TYPE'
        break
      case 'createdAt':
        sortKey = 'CREATED_AT'
        break
      case 'updatedAt':
        sortKey = 'UPDATED_AT'
        break
      case 'inventoryQuantity':
        sortKey = 'INVENTORY_TOTAL'
        break
      case 'id':
      case 'price':
      case 'medium':
      case 'year':
      case 'serie':
      case 'location':
      case 'dimensions':
        useManualSorting = true
        manualSortField = params.sortBy
        sortKey = 'TITLE'
        break
      default:
        sortKey = 'TITLE'
    }
  }

  if (params.sortOrder === 'desc') {
    reverse = true
  }

  const limit = params.limit ? parseInt(String(params.limit), 10) : 10

  if (useManualSorting || hasMetafieldFilters) {
    return await getProductsWithManualSorting(params, shopifyQuery, limit, reverse, manualSortField)
  } else {
    const variables = {
      after: params.cursor,
      first: limit,
      query: shopifyQuery,
      reverse,
      sortKey,
    }

    const response = await makeAdminApiRequest<GetProductsApiResponse>(
      GET_PRODUCTS_QUERY,
      variables
    )
    const locationId = await getPrimaryLocationId()
    let products = response.products.edges.map((edge) => new Product(edge.node, locationId))

    if (params.search?.trim()) {
      products = filterProductsByExactSearch(products, params.search)
    }

    return { pageInfo: response.products.pageInfo, products }
  }
}

async function getProductsWithManualSorting(
  params: GetProductsParams,
  shopifyQuery: string,
  limit: number,
  reverse: boolean,
  sortField: string
): Promise<PaginatedProductsResponse> {
  const allProducts: Product[] = []
  let hasNextPage = true
  let cursor: string | undefined = undefined
  let pageCount = 0
  const maxPages = 50

  while (hasNextPage && pageCount < maxPages) {
    const variables: {
      after?: string
      first: number
      query: string
      reverse: boolean
      sortKey: 'TITLE'
    } = {
      after: cursor,
      first: 250,
      query: shopifyQuery,
      reverse: false,
      sortKey: 'TITLE',
    }

    const response = await makeAdminApiRequest<GetProductsApiResponse>(
      GET_PRODUCTS_QUERY,
      variables
    )
    const locationId = await getPrimaryLocationId()
    const products = response.products.edges.map(
      (edge: { node: ShopifyProductData; cursor: string }) => new Product(edge.node, locationId)
    )

    allProducts.push(...products)

    hasNextPage = response.products.pageInfo.hasNextPage
    cursor = response.products.pageInfo.endCursor || undefined
    pageCount++
  }

  let filteredProducts = allProducts

  if (params.technique?.trim()) {
    const techniqueFilters = params.technique.split(',').map((t) => t.trim().toLowerCase())
    filteredProducts = filteredProducts.filter((p) => {
      const productTechnique = p.artworkDetails.medium?.toLowerCase() ?? ''
      return techniqueFilters.some((filter) => productTechnique.includes(filter))
    })
  }

  if (params.dimensions?.trim()) {
    const dimensionFilters = params.dimensions.split(',').map((f) => f.trim())
    const categoryFilters = ['chico', 'mediano', 'grande', 'extra-grande']
    const isCategoryFilter = dimensionFilters.some((f) => categoryFilters.includes(f))

    filteredProducts = filteredProducts.filter((p) => {
      const height = p.artworkDetails.height
      const width = p.artworkDetails.width
      const depth = p.artworkDetails.depth

      if (!height || !width) return false

      if (isCategoryFilter) {
        const category = categorizeDimensions(height, width, depth)
        return category && dimensionFilters.includes(category)
      } else {
        const dimensionText = formatDimensions(height, width, depth)
        return dimensionFilters.some((filter) => {
          const normalizedFilter = filter.replace(/\s*cm\s*/gi, '').trim()
          const normalizedDimension = dimensionText.replace(/\s*cm\s*/gi, '').trim()
          return normalizedDimension === normalizedFilter || dimensionText.includes(filter)
        })
      }
    })
  }

  if (params.year?.trim()) {
    const yearFilters = params.year.split(',').filter(Boolean)
    filteredProducts = filteredProducts.filter((p) => {
      const productYear = p.artworkDetails.year?.trim()
      if (!productYear) return false
      return yearFilters.some((filter) => productYear === filter.trim())
    })
  }

  if (params.search?.trim()) {
    filteredProducts = filterProductsByExactSearch(filteredProducts, params.search)
  }

  if (sortField) {
    filteredProducts.sort((a, b) => {
      let valueA: string | number = ''
      let valueB: string | number = ''

      switch (sortField) {
        case 'id': {
          const idA = a.id.split('/').pop() ?? a.id
          const idB = b.id.split('/').pop() ?? b.id
          valueA = parseInt(idA.replace(/\D/g, '')) || 0
          valueB = parseInt(idB.replace(/\D/g, '')) || 0
          break
        }
        case 'price':
          valueA = parseFloat(a.variants[0]?.price?.amount ?? '0')
          valueB = parseFloat(b.variants[0]?.price?.amount ?? '0')
          break
        case 'medium':
          valueA = a.artworkDetails.medium ?? ''
          valueB = b.artworkDetails.medium ?? ''
          break
        case 'year':
          valueA = parseInt(a.artworkDetails.year ?? '0')
          valueB = parseInt(b.artworkDetails.year ?? '0')
          break
        case 'serie':
          valueA = a.artworkDetails.serie ?? ''
          valueB = b.artworkDetails.serie ?? ''
          break
        case 'location':
          valueA = a.artworkDetails.location ?? ''
          valueB = b.artworkDetails.location ?? ''
          break
        case 'dimensions': {
          valueA = calculateDimensionValue(
            a.artworkDetails.height,
            a.artworkDetails.width,
            a.artworkDetails.depth
          )
          valueB = calculateDimensionValue(
            b.artworkDetails.height,
            b.artworkDetails.width,
            b.artworkDetails.depth
          )
          break
        }
        default:
          valueA = ''
          valueB = ''
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return reverse ? valueB - valueA : valueA - valueB
      } else {
        const comparison = String(valueA).localeCompare(String(valueB))
        return reverse ? -comparison : comparison
      }
    })
  }

  const startIndex = params.cursor ? parseInt(params.cursor, 10) : 0
  const endIndex = startIndex + limit
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const hasNextPageResult = endIndex < filteredProducts.length
  const endCursor = hasNextPageResult ? endIndex.toString() : null

  return {
    pageInfo: {
      endCursor,
      hasNextPage: hasNextPageResult,
    },
    products: paginatedProducts,
  }
}

async function getProductStats(search?: string, session?: AuthSession) {
  if (!session) {
    throw new Error('Session is required')
  }

  let shopifyQuery = ''

  if (search?.trim()) {
    shopifyQuery = `(title:*${search}* OR product_type:*${search}* OR vendor:*${search}*)`
  }

  // Obtener información del usuario para verificar si es artista
  const user = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      artist: true,
      role: true,
    },
    where: { id: session.user.id },
  })

  // Si el usuario es artista, establecer automáticamente su vendor
  const isArtist =
    user?.UserRole?.some((ur) => ur.role.name === 'artist') || user?.role?.name === 'artist'

  if (isArtist && user?.artist?.name) {
    if (shopifyQuery) {
      shopifyQuery += ` AND vendor:"${user.artist.name}"`
    } else {
      shopifyQuery = `vendor:"${user.artist.name}"`
    }
  }

  const allProducts: any[] = []
  let hasNextPage = true
  let cursor: string | undefined = undefined
  let pageCount = 0

  // Obtener TODOS los productos usando paginación
  while (hasNextPage) {
    pageCount++

    const variables: {
      after?: string
      first: number
      query: string
      reverse: boolean
      sortKey: 'TITLE'
    } = {
      after: cursor,
      first: 100, // Máximo permitido por Shopify
      query: shopifyQuery,
      reverse: false,
      sortKey: 'TITLE',
    }

    const response = await makeAdminApiRequest<GetProductsApiResponse>(
      GET_PRODUCTS_QUERY,
      variables
    )

    const locationId = await getPrimaryLocationId()
    const products = response.products.edges.map((edge: any) => new Product(edge.node, locationId))
    allProducts.push(...products)

    // Verificar si hay más páginas
    hasNextPage = response.products.pageInfo.hasNextPage
    cursor = response.products.pageInfo.endCursor ?? undefined

    // Para inventarios muy grandes, limitamos a 5000 productos máximo
    // Esto debería cubrir la mayoría de casos reales
    if (allProducts.length >= 5000) {
      break
    }
  }

  const stats = {
    active: allProducts.filter((p) => p.status === 'ACTIVE').length,
    archived: allProducts.filter((p) => p.status === 'ARCHIVED').length,
    draft: allProducts.filter((p) => p.status === 'DRAFT').length,
    inStock: allProducts.filter((p) => p.isAvailable).length,
    outOfStock: allProducts.filter((p) => !p.isAvailable).length,
    total: allProducts.length,
  }

  return stats
}

async function getProductById(id: string, session: AuthSession): Promise<Product | null> {
  validateSession(session)

  const response = await makeAdminApiRequest<{ product: ShopifyProductData | null }>(
    GET_SINGLE_PRODUCT_QUERY,
    { id }
  )
  if (!response.product) return null

  const locationId = await getPrimaryLocationId()
  const product = new Product(response.product, locationId)

  // Verificar si el usuario es artista y si el producto le pertenece
  const user = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      artist: true,
      role: true,
    },
    where: { id: session.user.id },
  })

  // Si el usuario es artista, verificar que el producto sea suyo
  const isArtist =
    user?.UserRole?.some((ur) => ur.role.name === 'artist') || user?.role?.name === 'artist'

  if (isArtist && user?.artist?.name) {
    if (product.vendor !== user.artist.name) {
      throw new Error('No tienes permisos para acceder a este producto.')
    }
  }

  return product
}

async function getProductByHandle(handle: string, session: AuthSession): Promise<Product | null> {
  validateSession(session)

  const shopifyQuery = `handle:"${handle}"`

  const variables = {
    first: 1,
    query: shopifyQuery,
    reverse: false,
    sortKey: 'TITLE' as const,
  }

  try {
    const response = await makeAdminApiRequest<GetProductsApiResponse>(
      GET_PRODUCTS_QUERY,
      variables
    )
    const locationId = await getPrimaryLocationId()

    if (response.products.edges.length > 0) {
      return new Product(response.products.edges[0].node, locationId)
    }

    return null
  } catch (error) {
    console.error('Error getting product by handle:', error)
    return null
  }
}

async function getProductsFromRequest(
  request: Request,
  session: AuthSession
): Promise<PaginatedProductsResponse> {
  const { searchParams } = new URL(request.url)

  // Obtener información del usuario para verificar si es artista
  const user = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      artist: true,
      role: true,
    },
    where: { id: session.user.id },
  })

  const params: GetProductsParams = {
    artworkType: searchParams.get('artworkType') ?? undefined,
    cursor: searchParams.get('cursor') ?? undefined,
    dimensions: searchParams.get('dimensions') ?? undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
    search: searchParams.get('search') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
    sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' | undefined,
    status: searchParams.get('status') ?? undefined,
    technique: searchParams.get('technique') ?? undefined,
    vendor: searchParams.get('vendor') ?? undefined,
  }

  // Si el usuario es artista, establecer automáticamente su vendor
  const isArtist =
    user?.UserRole?.some((ur) => ur.role.name === 'artist') || user?.role?.name === 'artist'

  if (isArtist && user?.artist?.name) {
    params.vendor = user.artist.name
  }

  if (params.limit && (params.limit < 1 || params.limit > 1000)) {
    throw new Error('El límite debe estar entre 1 y 1000')
  }

  if (params.page && params.page < 1) {
    throw new Error('La página debe ser al menos 1')
  }

  return getProducts(params, session)
}

async function createProduct(
  payload: CreateProductPayload,
  session: AuthSession
): Promise<Product> {
  validateSession(session)

  const user = await prisma.user.findUnique({
    include: { artist: true, role: true },
    where: { id: session.user.id },
  })

  if (user?.role?.name === 'artist' || user?.role?.name === 'admin') {
    payload.vendor = user.artist?.name
  }

  if (!payload.vendor) {
    throw new Error("El campo 'vendor' es requerido.")
  }

  const createInput = {
    descriptionHtml: payload.description ? `<p>${payload.description}</p>` : '',
    productType: payload.productType || '',
    status: payload.status,
    tags: payload.tags,
    title: payload.title,
    vendor: payload.vendor,
  }

  const response = await makeAdminApiRequest<ProductMutationResponse<'productCreate'>>(
    CREATE_PRODUCT_MUTATION,
    { input: createInput }
  )

  if (response.productCreate.userErrors.length > 0) {
    throw new Error(response.productCreate.userErrors.map((e) => e.message).join(', '))
  }

  const newProductData = response.productCreate.product

  // Crear metafields para los detalles de la obra si se proporcionan
  if (payload.details) {
    try {
      const metafields = Object.entries(payload.details)
        .filter(([, value]) => value != null && value !== undefined && value !== '')
        .map(([key, value]) => ({
          key,
          namespace: 'art_details',
          type: 'single_line_text_field',
          value: String(value),
        }))

      if (metafields.length > 0) {
        await createMetafields(newProductData.id, metafields)
      }
    } catch (metafieldError) {
      console.error('Error al crear metafields para detalles de la obra:', metafieldError)
      // No lanzar error aquí para no interrumpir la creación del producto
    }
  }

  if (payload.images && payload.images.length > 0) {
    try {
      await addImagesToProduct(newProductData.id, payload.images)
    } catch (imageError) {
      console.error('Error al agregar imágenes al producto:', imageError)
    }
  }

  if (payload.price && parseFloat(payload.price) > 0) {
    const defaultVariant = newProductData.variants.edges[0]?.node
    try {
      const variantUpdatePayload = {
        productId: newProductData.id,
        variants: [
          {
            id: defaultVariant.id,
            price: payload.price,
          },
        ],
      }

      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        variantUpdatePayload
      )
    } catch (variantError) {
      console.error('Error al actualizar el precio del producto:', variantError)
    }
  }

  if (payload.inventoryQuantity && payload.inventoryQuantity > 0) {
    const defaultVariant = newProductData.variants.edges[0]?.node
    try {
      // Primero, activar el tracking de inventario para la variante
      const variantUpdatePayload = {
        productId: newProductData.id,
        variants: [
          {
            id: defaultVariant.id,
            inventoryItem: { tracked: true },
            inventoryPolicy: 'DENY', // No permitir venta cuando no hay stock
          },
        ],
      }

      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        variantUpdatePayload
      )

      const locationId = await getPrimaryLocationId()

      const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
        GET_INVENTORY_ITEM_QUERY,
        { variantId: defaultVariant.id }
      )

      if (inventoryItemResponse.productVariant?.inventoryItem.id) {
        const inventoryItemId = inventoryItemResponse.productVariant.inventoryItem.id

        const inventoryUpdatePayload = {
          input: {
            reason: 'correction',
            setQuantities: [
              {
                inventoryItemId,
                locationId,
                quantity: payload.inventoryQuantity,
              },
            ],
          },
        }

        await makeAdminApiRequest<InventorySetOnHandQuantitiesResponse>(
          INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
          inventoryUpdatePayload
        )

        // Revalidar cache manualmente después de crear producto con inventario
        try {
          const revalidationResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/revalidate`, {
            body: JSON.stringify({
              productId: newProductData.id,
              type: 'inventory',
            }),
            headers: {
              Authorization: `Bearer ${process.env.REVALIDATION_SECRET}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          if (revalidationResponse.ok) {
            // Cache revalidado automáticamente
          } else {
            console.log('⚠️ Error revalidando cache:', revalidationResponse.status)
          }
        } catch (revalidationError) {
          console.log('⚠️ Error en revalidación manual:', revalidationError)
        }
      }
    } catch (inventoryError) {
      console.error('Error al actualizar la cantidad de inventario del producto:', inventoryError)
    }
  }

  try {
    const publications = await makeAdminApiRequest<GetPublicationsApiResponse>(
      GET_PUBLICATIONS_QUERY,
      {}
    )
    const publicationInputs = publications.publications.edges.map((edge) => ({
      publicationId: edge.node.id,
    }))

    if (publicationInputs.length > 0) {
      await makeAdminApiRequest(PUBLISH_PRODUCT_MUTATION, {
        id: newProductData.id,
        input: publicationInputs,
      })
    }
  } catch (publishError) {
    console.error('Error al publicar el producto:', publishError)
  }

  const finalProduct = await getProductById(newProductData.id, session)
  if (!finalProduct) {
    throw new Error('Error al obtener el producto creado')
  }

  // Registrar ubicación inicial si se proporcionó
  if (payload.details?.location) {
    try {
      let locationIdToTrack: string | null = null

      const location = await prisma.location.findFirst({
        where: { name: payload.details.location },
      })
      locationIdToTrack = location?.id || null

      await locationTrackingService.createLocationHistory({
        changedBy: session.user.id,
        handle: finalProduct.handle,
        locationId: locationIdToTrack,
        productId: finalProduct.id,
        shopifyGid: finalProduct.id,
        title: finalProduct.title,
        vendor: finalProduct.vendor,
      })
    } catch (locationError) {
      console.error('Error tracking initial location:', locationError)
    }
  }

  return finalProduct
}

async function createMetafields(
  productId: string,
  metafields: {
    namespace: string
    key: string
    value: string
    type: string
  }[]
) {
  if (metafields.length === 0) return

  try {
    const metafieldsInput = metafields.map((mf) => ({
      key: mf.key,
      namespace: mf.namespace,
      ownerId: productId,
      type: mf.type,
      value: mf.value,
    }))

    const METAFIELDS_SET_MUTATION = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `

    const response = await makeAdminApiRequest<{
      metafieldsSet: {
        metafields: any[]
        userErrors: { field: string; message: string; code: string }[]
      }
    }>(METAFIELDS_SET_MUTATION, { metafields: metafieldsInput })

    if (response.metafieldsSet.userErrors.length > 0) {
      console.error('Error al crear metafields:', response.metafieldsSet.userErrors)
      throw new Error(response.metafieldsSet.userErrors.map((e) => e.message).join(', '))
    }
  } catch (error) {
    console.error('Error al crear metafields:', error)
    throw error
  }
}

async function addImagesToProduct(
  productId: string,
  images: { mediaContentType: 'IMAGE'; originalSource: string }[]
) {
  const mediaInput = images.map((img) => ({
    mediaContentType: img.mediaContentType,
    originalSource: img.originalSource,
  }))

  const response = await makeAdminApiRequest<ProductCreateMediaResponse>(
    PRODUCT_CREATE_MEDIA_MUTATION,
    {
      media: mediaInput,
      productId,
    }
  )

  if (response.productCreateMedia.mediaUserErrors.length > 0) {
    throw new Error(
      response.productCreateMedia.mediaUserErrors.map((e: ShopifyUserError) => e.message).join(', ')
    )
  }

  if (response.productCreateMedia.userErrors.length > 0) {
    throw new Error(
      response.productCreateMedia.userErrors.map((e: ShopifyUserError) => e.message).join(', ')
    )
  }

  return response.productCreateMedia.media
}

async function deleteImagesFromProduct(productId: string, imageIds: string[]) {
  if (imageIds.length === 0) return

  // Eliminar imágenes una por una para manejar errores individuales
  const results = []
  for (const imageId of imageIds) {
    try {
      const response = await makeAdminApiRequest<{
        productDeleteMedia: {
          deletedMediaIds: string[] | null
          deletedProductImageIds: string[] | null
          mediaUserErrors: ShopifyUserError[]
          product: {
            id: string
            title: string
            media: {
              nodes: {
                id: string
                alt: string | null
                mediaContentType: string
                status: string
              }[]
            }
          }
        }
      }>(PRODUCT_DELETE_MEDIA_MUTATION, {
        mediaIds: [imageId],
        productId, // Solo una imagen a la vez
      })

      if (response.productDeleteMedia.mediaUserErrors.length > 0) {
        console.warn(
          `Error al eliminar imagen ${imageId}:`,
          response.productDeleteMedia.mediaUserErrors
        )
        results.push({
          error: response.productDeleteMedia.mediaUserErrors,
          imageId,
          success: false,
        })
      } else {
        results.push({ imageId, success: true })
      }
    } catch (error) {
      console.warn(`Error al eliminar imagen ${imageId}:`, error)
      results.push({
        error: error instanceof Error ? error.message : 'Error desconocido',
        imageId,
        success: false,
      })
    }
  }

  // Log de resultados
  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  if (failed.length > 0) {
    console.warn(
      `${failed.length} imágenes no pudieron ser eliminadas:`,
      failed.map((f) => f.imageId)
    )
  }

  // No lanzar error si al menos algunas imágenes se eliminaron
  if (successful.length === 0 && failed.length > 0) {
    throw new Error(
      `No se pudo eliminar ninguna imagen. Errores: ${failed.map((f) => f.error).join(', ')}`
    )
  }
}

async function createProductFromRequest(request: Request, session: AuthSession): Promise<Product> {
  const body = await request.json()

  if (!body.title?.trim()) {
    throw new Error('El título es requerido')
  }

  if (body.price && isNaN(parseFloat(body.price))) {
    throw new Error('El precio debe ser un número válido')
  }

  if (
    body.inventoryQuantity &&
    (!Number.isInteger(body.inventoryQuantity) || body.inventoryQuantity < 0)
  ) {
    throw new Error('La cantidad de inventario debe ser un número entero positivo')
  }

  const payload: CreateProductPayload = {
    description: body.description?.trim() ?? '',
    details: body.details ?? {},
    images: Array.isArray(body.images) ? body.images : undefined,
    inventoryQuantity: body.inventoryQuantity ?? 1,
    price: body.price ?? '0',
    productType: body.productType?.trim() ?? '',
    status: body.status ?? 'DRAFT',
    tags: Array.isArray(body.tags) ? body.tags.filter((tag: string) => tag.trim()) : [],
    title: body.title.trim(),
    vendor: body.vendor?.trim() ?? undefined,
  }

  return createProduct(payload, session)
}

async function updateProduct(
  payload: UpdateProductPayload,
  session: AuthSession
): Promise<Product> {
  validateSession(session)

  const existingProduct = await getProductById(payload.id, session)
  if (!existingProduct) throw new Error('Producto no encontrado o no tienes permiso para editarlo.')

  existingProduct.update(payload)

  const { updatePayload } = existingProduct.toShopifyInput()
  const { variants, ...productUpdateInput } = updatePayload.input

  // Remover la lógica de imágenes del productUpdate ya que no es un campo válido
  // Las imágenes se manejarán por separado después de la actualización del producto

  const productUpdateResponse = await makeAdminApiRequest<ProductMutationResponse<'productUpdate'>>(
    UPDATE_PRODUCT_MUTATION,
    { input: productUpdateInput }
  )

  if (productUpdateResponse.productUpdate.userErrors.length > 0) {
    throw new Error(productUpdateResponse.productUpdate.userErrors.map((e) => e.message).join(', '))
  }

  if (variants.length > 0) {
    const variant = variants[0]

    if (payload.price) {
      const priceUpdatePayload = {
        productId: existingProduct.id,
        variants: [
          {
            id: variant.id,
            price: String(variant.price),
          },
        ],
      }

      const variantUpdateResponse = await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        priceUpdatePayload
      )

      if (variantUpdateResponse.productVariantsBulkUpdate.userErrors.length > 0) {
        throw new Error(
          variantUpdateResponse.productVariantsBulkUpdate.userErrors
            .map((e) => e.message)
            .join(', ')
        )
      }
    }

    if (payload.inventoryQuantity !== undefined) {
      try {
        // Primero, activar el tracking de inventario para la variante
        const variantUpdatePayload = {
          productId: existingProduct.id,
          variants: [
            {
              id: variant.id,
              inventoryItem: { tracked: true },
              inventoryPolicy: 'DENY', // No permitir venta cuando no hay stock
            },
          ],
        }

        await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
          PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
          variantUpdatePayload
        )

        const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
          GET_INVENTORY_ITEM_QUERY,
          { variantId: variant.id }
        )

        if (inventoryItemResponse.productVariant?.inventoryItem.id) {
          const inventoryItemId = inventoryItemResponse.productVariant.inventoryItem.id
          const locationId = await getPrimaryLocationId()

          const inventoryUpdatePayload = {
            input: {
              reason: 'correction',
              setQuantities: [
                {
                  inventoryItemId,
                  locationId,
                  quantity: payload.inventoryQuantity,
                },
              ],
            },
          }

          const inventoryResponse = await makeAdminApiRequest<InventorySetOnHandQuantitiesResponse>(
            INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
            inventoryUpdatePayload
          )

          if (inventoryResponse.inventorySetOnHandQuantities.userErrors.length > 0) {
            throw new Error(
              inventoryResponse.inventorySetOnHandQuantities.userErrors
                .map((e) => e.message)
                .join(', ')
            )
          }

          // Revalidar cache manualmente después de actualizar inventario
          try {
            await fetch(`${process.env.NEXTAUTH_URL}/api/revalidate`, {
              body: JSON.stringify({
                productId: existingProduct.id,
                type: 'inventory',
              }),
              headers: {
                Authorization: `Bearer ${process.env.REVALIDATION_SECRET}`,
                'Content-Type': 'application/json',
              },
              method: 'POST',
            })
          } catch (revalidationError) {
            // Silenciar errores de revalidación
          }
        }
      } catch (inventoryError) {
        console.error('Error al actualizar la cantidad de inventario del producto:', inventoryError)
      }
    }
  }

  const locationId = await getPrimaryLocationId()

  // Manejar la adición de nuevas imágenes si se proporcionan
  if (payload.images && payload.images.length > 0) {
    try {
      await addImagesToProduct(existingProduct.id, payload.images)
    } catch (imageError) {
      console.error('Error al agregar imágenes al producto:', imageError)
      // No lanzar error aquí para no interrumpir la actualización del producto
    }
  }

  // Manejar la eliminación de imágenes si se proporcionan
  if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
    try {
      await deleteImagesFromProduct(existingProduct.id, payload.imagesToDelete)
    } catch (imageError) {
      console.error('Error al eliminar imágenes del producto:', imageError)
      // No lanzar error aquí para no interrumpir la actualización del producto
    }
  }

  // Registrar cambio de ubicación si se proporcionó una nueva
  if (payload.details?.location !== undefined) {
    try {
      let locationIdToTrack: string | null = null

      if (payload.details.location) {
        const location = await prisma.location.findFirst({
          where: { name: payload.details.location },
        })
        locationIdToTrack = location?.id || null
      }

      await locationTrackingService.createLocationHistory({
        changedBy: session.user.id,
        handle: existingProduct.handle,
        locationId: locationIdToTrack,
        productId: existingProduct.id,
        shopifyGid: existingProduct.id,
        title: existingProduct.title,
        vendor: existingProduct.vendor,
      })
    } catch (locationError) {
      console.error('Error tracking location change:', locationError)
    }
  }

  return new Product(productUpdateResponse.productUpdate.product, locationId)
}

async function deleteProduct(id: string, session: AuthSession): Promise<string> {
  validateSession(session)

  const productToDelete = await getProductById(id, session)
  if (!productToDelete) throw new Error('Producto no encontrado o no tienes permiso para borrarlo.')

  const response = await makeAdminApiRequest<DeleteMutationResponse>(DELETE_PRODUCT_MUTATION, {
    input: { id },
  })

  if (response.productDelete.userErrors.length > 0) {
    throw new Error(response.productDelete.userErrors.map((e) => e.message).join(', '))
  }
  return response.productDelete.deletedProductId!
}

async function getProductsPublic(params: GetProductsParams): Promise<PaginatedProductsResponse> {
  let shopifyQuery = ''

  if (params.search?.trim()) {
    shopifyQuery = buildProductSearchQuery(params.search)
  }

  if (params.vendor?.trim()) {
    if (shopifyQuery) {
      shopifyQuery += ` AND vendor:"${params.vendor}"`
    } else {
      shopifyQuery = `vendor:"${params.vendor}"`
    }
  }

  if (params.status?.trim()) {
    if (shopifyQuery) {
      shopifyQuery += ` AND status:${params.status}`
    } else {
      shopifyQuery = `status:${params.status}`
    }
  }

  if (params.artworkType?.trim()) {
    if (shopifyQuery) {
      shopifyQuery += ` AND product_type:"${params.artworkType}"`
    } else {
      shopifyQuery = `product_type:"${params.artworkType}"`
    }
  }

  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    let priceQuery = ''
    if (params.priceMin !== undefined && params.priceMin > 0) {
      priceQuery = `price:>=${params.priceMin}`
    }
    if (params.priceMax !== undefined) {
      if (priceQuery) {
        priceQuery += ` AND price:<=${params.priceMax}`
      } else {
        priceQuery = `price:<=${params.priceMax}`
      }
    }
    if (priceQuery) {
      if (shopifyQuery) {
        shopifyQuery += ` AND (${priceQuery})`
      } else {
        shopifyQuery = priceQuery
      }
    }
  }

  const hasMetafieldFilters =
    params.technique?.trim() ?? params.dimensions?.trim() ?? params.year?.trim()

  let sortKey = 'TITLE' // Default sort key
  let reverse = false // Default sort order
  let useManualSorting = false // Flag para usar sorting manual
  let manualSortField = '' // Campo para sorting manual

  if (params.sortBy) {
    switch (params.sortBy) {
      case 'title':
        sortKey = 'TITLE'
        break
      case 'vendor':
        sortKey = 'VENDOR'
        break
      case 'productType':
        sortKey = 'PRODUCT_TYPE'
        break
      case 'createdAt':
        sortKey = 'CREATED_AT'
        break
      case 'updatedAt':
        sortKey = 'UPDATED_AT'
        break
      case 'inventoryQuantity':
        sortKey = 'INVENTORY_TOTAL'
        break
      case 'id':
      case 'price':
      case 'medium':
      case 'year':
      case 'serie':
      case 'location':
      case 'dimensions':
        useManualSorting = true
        manualSortField = params.sortBy
        sortKey = 'TITLE'
        break
      default:
        sortKey = 'TITLE'
    }
  }

  if (params.sortOrder === 'desc') {
    reverse = true
  }

  const limit = params.limit ? parseInt(String(params.limit), 10) : 10

  if (useManualSorting || hasMetafieldFilters) {
    return await getProductsWithManualSorting(params, shopifyQuery, limit, reverse, manualSortField)
  } else {
    const variables = {
      after: params.cursor,
      first: limit,
      query: shopifyQuery,
      reverse,
      sortKey,
    }

    const response = await makeAdminApiRequest<GetProductsApiResponse>(
      GET_PRODUCTS_QUERY,
      variables
    )
    const locationId = await getPrimaryLocationId()
    let products = response.products.edges.map((edge) => new Product(edge.node, locationId))

    if (params.search?.trim()) {
      products = filterProductsByExactSearch(products, params.search)
    }

    return { pageInfo: response.products.pageInfo, products }
  }
}

export const productService = {
  createProduct,
  createProductFromRequest,
  deleteProduct,
  getProductByHandle,
  getProductById,
  getProductStats,
  getProducts,
  getProductsFromRequest,
  getProductsPublic,
  updateProduct,
}
