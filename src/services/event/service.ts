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
  type ProductMutationResponse,
  type ShopifyProductData,
  type UpdateProductPayload,
} from '@/services/product/types'

type ValidatedSession = NonNullable<AuthSession>

// Adaptamos los tipos para eventos
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
  if (!session?.user?.id) {
    throw new Error('Sesión no válida o usuario no autenticado.')
  }
}

async function getPrimaryLocationId(): Promise<string> {
  if (primaryLocationId) return primaryLocationId

  const response = await makeAdminApiRequest<{ locations: { edges: { node: { id: string } }[] } }>(
    `query { locations(first: 1, query: "is_active:true") { edges { node { id name } } } }`,
    {}
  )

  const locationId = response.locations?.edges[0]?.node?.id
  if (!locationId) {
    throw new Error('No se pudo encontrar una ubicación de Shopify para gestionar el inventario.')
  }

  primaryLocationId = locationId
  return primaryLocationId
}

async function getEvents(
  params: GetProductsParams,
  session: AuthSession
): Promise<PaginatedEventsResponse> {
  validateSession(session)
  await requirePermission('manage_events')

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
  await requirePermission('manage_events')

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
  await requirePermission('manage_events')

  const { description, details, inventoryQuantity, price, ...rest } = payload

  // Paso 1: Crear el producto sin variants (igual que en productService)
  const createInput = {
    ...rest,
    descriptionHtml: description ? `<p>${description}</p>` : '',
    // Agregamos los metafields de detalles del evento
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

  // Paso 1.5: Crear metafields por separado si existen details
  if (details && Object.keys(details).length > 0) {
    try {
      const metafieldsInput = Object.entries(details)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
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

        console.log('createEvent: Creating metafields:', metafieldsInput)

        const metafieldsResponse = await makeAdminApiRequest<{
          metafieldsSet: {
            metafields: any[]
            userErrors: { field: string; message: string; code: string }[]
          }
        }>(METAFIELDS_SET_MUTATION, { metafields: metafieldsInput })

        console.log('createEvent: Metafields created:', metafieldsResponse.metafieldsSet)

        if (metafieldsResponse.metafieldsSet.userErrors.length > 0) {
          console.error(
            'Error al crear metafields del evento:',
            metafieldsResponse.metafieldsSet.userErrors
          )
          // No fallar la creación del evento por problemas con metafields
        }
      }
    } catch (metafieldsError) {
      console.error('Error al crear metafields del evento:', metafieldsError)
      throw new Error('Error al crear metafields del evento.')
    }
  }

  // Paso 2: Actualizar precio si se proporciona (igual que en productService)
  if (price && parseFloat(price) > 0) {
    console.log('createEvent: Updating price to:', price)
    const defaultVariant = newEventData.variants?.edges[0]?.node
    if (defaultVariant) {
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
        console.log('createEvent: Price updated successfully')
      } catch (variantError) {
        console.error('Error al actualizar el precio del evento:', variantError)
        throw new Error('Error al actualizar el precio del evento.')
      }
    }
  }

  // Paso 3: Actualizar inventario si se proporciona (igual que en productService)
  if (inventoryQuantity && inventoryQuantity > 0) {
    const defaultVariant = newEventData.variants?.edges[0]?.node
    if (defaultVariant) {
      try {
        const locationId = await getPrimaryLocationId()

        // Primero, necesitamos habilitar el tracking del inventario
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

        // Luego actualizamos la cantidad
        const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
          GET_INVENTORY_ITEM_QUERY,
          { variantId: defaultVariant.id }
        )

        if (inventoryItemResponse.productVariant?.inventoryItem?.id) {
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
  }

  // Paso 4: Publicar el evento en los canales de venta (igual que en productService)
  try {
    console.log('createEvent: Publishing event to sales channels')
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
      console.log('createEvent: Event published successfully')
    }
  } catch (publishError) {
    console.error('Error al publicar el evento:', publishError)
  }

  // Paso 5: Obtener el evento final actualizado
  console.log('createEvent: Fetching final event')
  const finalEvent = await getEventById(newEventData.id, session)
  if (!finalEvent) {
    throw new Error('Error al obtener el evento creado')
  }

  // Paso 6: Crear una entrada en el modelo Event de Prisma
  try {
    await prisma.event.create({
      data: {
        name: newEventData.title,
        shopifyProductId: newEventData.id.split('/').pop() || '',
      },
    })
    console.log('createEvent: Prisma Event entry created successfully')
  } catch (prismaError) {
    console.error('Error al crear la entrada de Prisma Event:', prismaError)
    // Considerar si se debe revertir la creación en Shopify o solo loggear el error
  }

  console.log('createEvent: Event created successfully:', finalEvent.id)
  return finalEvent
}

async function updateEvent(payload: UpdateEventPayload, session: AuthSession): Promise<Event> {
  validateSession(session)
  await requirePermission('manage_events')

  const existingEvent = await getEventById(payload.id, session)
  if (!existingEvent) throw new Error('Evento no encontrado.')

  const { description, details, id, inventoryQuantity, price, ...rest } = payload

  // Paso 1: Actualizar el producto base
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

  // Paso 2: Actualizar precio si se proporciona
  if (price !== undefined) {
    const defaultVariant = existingEvent.variants[0]
    if (defaultVariant) {
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
  }

  // Paso 3: Actualizar inventario si se proporciona
  if (inventoryQuantity !== undefined) {
    const defaultVariant = existingEvent.variants[0]
    if (defaultVariant) {
      try {
        // Primero, asegurar que el tracking esté habilitado
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

        // Luego actualizar la cantidad
        const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
          GET_INVENTORY_ITEM_QUERY,
          { variantId: defaultVariant.id }
        )

        if (inventoryItemResponse.productVariant?.inventoryItem?.id) {
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
  }

  // Paso 4: Obtener el evento final actualizado
  const locationId = await getPrimaryLocationId()
  return new Event(response.productUpdate.product, locationId)
}

async function deleteEvent(id: string, session: AuthSession): Promise<string> {
  validateSession(session)
  await requirePermission('manage_events')

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
