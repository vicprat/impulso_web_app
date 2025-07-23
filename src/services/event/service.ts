/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { Event } from '@/models/Event'
import { requirePermission } from '@/modules/auth/server/server'
import { type AuthSession } from '@/modules/auth/service'
import {
  CREATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  GET_INVENTORY_ITEM_QUERY,
  GET_PRODUCTS_QUERY,
  GET_PUBLICATIONS_QUERY,
  GET_SINGLE_PRODUCT_QUERY,
  INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
  PRODUCT_CREATE_MEDIA_MUTATION,
  PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
  PUBLISH_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
} from '@/services/product/queries'
import {
  type CreateProductPayload,
  type GetInventoryItemResponse,
  type GetProductsParams,
  type GetPublicationsApiResponse,
  type InventorySetOnHandQuantitiesResponse,
  type PaginatedProductsResponse,
  type ProductCreateMediaResponse,
  type ProductMutationResponse,
  type ShopifyProductData,
  type UpdateProductPayload,
} from '@/services/product/types'
import { PERMISSIONS } from '@/src/config/Permissions'

type ValidatedSession = NonNullable<AuthSession>

type PaginatedEventsResponse = PaginatedProductsResponse
type CreateEventPayload = CreateProductPayload
type UpdateEventPayload = UpdateProductPayload
type ShopifyEventData = ShopifyProductData

interface ProductVariantsBulkUpdateResponse {
  productVariantsBulkUpdate: {
    productVariants: { id: string }[]
    userErrors: { field: string[]; message: string }[]
  }
}

let primaryLocationId: string | null = null

function validateSession(session: AuthSession): asserts session is ValidatedSession {
  if (!session.user.id) {
    throw new Error('Sesión no válida o usuario no autenticado.')
  }
}

async function getPrimaryLocationId(): Promise<string> {
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

async function addImagesToEvent(
  eventId: string,
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
      productId: eventId,
    }
  )

  if (response.productCreateMedia.mediaUserErrors.length > 0) {
    throw new Error(
      response.productCreateMedia.mediaUserErrors.map((e: any) => e.message).join(', ')
    )
  }

  if (response.productCreateMedia.userErrors.length > 0) {
    throw new Error(response.productCreateMedia.userErrors.map((e: any) => e.message).join(', '))
  }

  return response.productCreateMedia.media
}

async function getEvents(
  params: GetProductsParams,
  session: AuthSession
): Promise<PaginatedEventsResponse> {
  validateSession(session)
  await requirePermission(PERMISSIONS.MANAGE_EVENTS)

  let shopifyQuery = "product_type:'Evento'"

  if (params.search?.trim()) {
    shopifyQuery += ` AND (title:*${params.search}* OR vendor:*${params.search}*)`
  }

  const variables = {
    after: params.cursor,
    first: params.limit ? parseInt(String(params.limit), 10) : 10,
    query: shopifyQuery,
  }

  const response = await makeAdminApiRequest<{
    products: { edges: { node: ShopifyEventData }[]; pageInfo: any }
  }>(GET_PRODUCTS_QUERY, variables)

  const locationId = await getPrimaryLocationId()
  const events = response.products.edges.map((edge) => new Event(edge.node, locationId))

  return { pageInfo: response.products.pageInfo, products: events as any }
}

async function getEventById(id: string, session: AuthSession): Promise<Event | null> {
  validateSession(session)
  await requirePermission(PERMISSIONS.MANAGE_EVENTS)

  const response = await makeAdminApiRequest<{ product: ShopifyEventData | null }>(
    GET_SINGLE_PRODUCT_QUERY,
    { id }
  )
  if (!response.product) return null

  const locationId = await getPrimaryLocationId()
  return new Event(response.product, locationId)
}

async function createEvent(payload: CreateEventPayload, session: AuthSession): Promise<Event> {
  validateSession(session)
  await requirePermission(PERMISSIONS.MANAGE_EVENTS)

  const { description, details, images, inventoryQuantity, price, ...rest } = payload

  const createInput = {
    ...rest,
    descriptionHtml: description ? `<p>${description}</p>` : '',
    metafields: details
      ? Object.keys(details).map((key) => ({
          key,
          namespace: 'event_details',
          type: 'single_line_text_field',
          value: String(details[key as keyof typeof details]),
        }))
      : [],

    productType: 'Evento',
  }

  const response = await makeAdminApiRequest<ProductMutationResponse<'productCreate'>>(
    CREATE_PRODUCT_MUTATION,
    { input: createInput }
  )

  if (response.productCreate.userErrors.length > 0) {
    throw new Error(response.productCreate.userErrors.map((e) => e.message).join(', '))
  }

  const newEventData = response.productCreate.product

  if (images && images.length > 0) {
    try {
      await addImagesToEvent(newEventData.id, images)
    } catch (imageError) {
      console.error('Error al agregar imágenes al evento:', imageError)
    }
  }

  if (details && Object.keys(details).length > 0) {
    try {
      const metafieldsInput = Object.entries(details)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => ({
          key,
          namespace: 'event_details',
          ownerId: newEventData.id,
          type: 'single_line_text_field',
          value: String(value),
        }))

      if (metafieldsInput.length > 0) {
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

        const metafieldsResponse = await makeAdminApiRequest<{
          metafieldsSet: {
            metafields: any[]
            userErrors: { field: string; message: string; code: string }[]
          }
        }>(METAFIELDS_SET_MUTATION, { metafields: metafieldsInput })

        if (metafieldsResponse.metafieldsSet.userErrors.length > 0) {
          console.error(
            'Error al crear metafields del evento:',
            metafieldsResponse.metafieldsSet.userErrors
          )
        }
      }
    } catch (metafieldsError) {
      console.error('Error al crear metafields del evento:', metafieldsError)
      throw new Error('Error al crear metafields del evento.')
    }
  }

  if (price && parseFloat(price) > 0) {
    const defaultVariant = newEventData.variants.edges[0]?.node
    try {
      const variantUpdatePayload = {
        productId: newEventData.id,
        variants: [
          {
            id: defaultVariant.id,
            price,
          },
        ],
      }

      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        variantUpdatePayload
      )
    } catch (variantError) {
      console.error('Error al actualizar el precio del evento:', variantError)
      throw new Error('Error al actualizar el precio del evento.')
    }
  }

  if (inventoryQuantity && inventoryQuantity > 0) {
    const defaultVariant = newEventData.variants.edges[0]?.node
    try {
      const locationId = await getPrimaryLocationId()

      const variantUpdatePayload = {
        productId: newEventData.id,
        variants: [
          {
            id: defaultVariant.id,
            inventoryItem: { tracked: true },
          },
        ],
      }

      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        variantUpdatePayload
      )

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
                quantity: inventoryQuantity,
              },
            ],
          },
        }

        await makeAdminApiRequest<InventorySetOnHandQuantitiesResponse>(
          INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
          inventoryUpdatePayload
        )
      }
    } catch (inventoryError) {
      console.error('Error al actualizar la cantidad de inventario del evento:', inventoryError)
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
        id: newEventData.id,
        input: publicationInputs,
      })
    }
  } catch (publishError) {
    console.error('Error al publicar el evento:', publishError)
  }

  const finalEvent = await getEventById(newEventData.id, session)
  if (!finalEvent) {
    throw new Error('Error al obtener el evento creado')
  }

  try {
    await prisma.event.create({
      data: {
        name: newEventData.title,
        shopifyProductId: newEventData.id.split('/').pop() ?? '',
      },
    })
  } catch (prismaError) {
    console.error('Error al crear la entrada de Prisma Event:', prismaError)
  }

  return finalEvent
}

async function updateEvent(payload: UpdateEventPayload, session: AuthSession): Promise<Event> {
  validateSession(session)
  await requirePermission(PERMISSIONS.MANAGE_EVENTS)

  const existingEvent = await getEventById(payload.id, session)
  if (!existingEvent) throw new Error('Evento no encontrado.')

  const { description, details, id, images, inventoryQuantity, price, ...rest } = payload

  const updateInput: any = {
    id,
    ...rest,
  }

  if (description !== undefined) {
    updateInput.descriptionHtml = description
  }

  if (details !== undefined) {
    updateInput.metafields = Object.keys(details).map((key) => ({
      key,
      namespace: 'event_details',
      type: 'single_line_text_field',
      value: String(details[key as keyof typeof details]),
    }))
  }

  const response = await makeAdminApiRequest<ProductMutationResponse<'productUpdate'>>(
    UPDATE_PRODUCT_MUTATION,
    { input: updateInput }
  )

  if (response.productUpdate.userErrors.length > 0) {
    throw new Error(response.productUpdate.userErrors.map((e) => e.message).join(', '))
  }

  if (images && images.length > 0) {
    try {
      await addImagesToEvent(payload.id, images)
    } catch (imageError) {
      console.error('Error al agregar imágenes al evento:', imageError)
    }
  }

  if (price !== undefined) {
    const defaultVariant = existingEvent.variants[0]
    try {
      const variantUpdatePayload = {
        productId: payload.id,
        variants: [
          {
            id: defaultVariant.id,
            price,
          },
        ],
      }

      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        variantUpdatePayload
      )
    } catch (variantError) {
      console.error('Error al actualizar el precio del evento:', variantError)
    }
  }

  if (inventoryQuantity !== undefined) {
    const defaultVariant = existingEvent.variants[0]
    try {
      const variantUpdatePayload = {
        productId: payload.id,
        variants: [
          {
            id: defaultVariant.id,
            inventoryItem: { tracked: true },
          },
        ],
      }

      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
        PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
        variantUpdatePayload
      )

      const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
        GET_INVENTORY_ITEM_QUERY,
        { variantId: defaultVariant.id }
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
                quantity: inventoryQuantity,
              },
            ],
          },
        }

        await makeAdminApiRequest<InventorySetOnHandQuantitiesResponse>(
          INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
          inventoryUpdatePayload
        )
      }
    } catch (inventoryError) {
      console.error('Error al actualizar la cantidad de inventario del evento:', inventoryError)
    }
  }

  const locationId = await getPrimaryLocationId()
  return new Event(response.productUpdate.product, locationId)
}

async function deleteEvent(id: string, session: AuthSession): Promise<string> {
  validateSession(session)
  await requirePermission(PERMISSIONS.MANAGE_EVENTS)

  const response = await makeAdminApiRequest<{
    productDelete: { deletedProductId: string; userErrors: any[] }
  }>(DELETE_PRODUCT_MUTATION, {
    input: { id },
  })

  if (response.productDelete.userErrors.length > 0) {
    throw new Error(response.productDelete.userErrors.map((e) => e.message).join(', '))
  }
  return response.productDelete.deletedProductId
}

export const eventService = {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
}
