import { NextResponse, type NextRequest } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: encodedId } = await params
    const id = decodeURIComponent(encodedId)
    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    // Verificar el tipo de colección antes de intentar agregar productos
    const formattedCollectionId = id.startsWith('gid://shopify/Collection/')
      ? id
      : `gid://shopify/Collection/${id}`

    const GET_COLLECTION_QUERY = `
      query getCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          publicationCount
          ruleSet {
            appliedDisjunctively
            rules {
              column
              relation
              condition
            }
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `

    let existingProductIds = new Set<string>()
    let collectionTitle = ''

    try {
      const collectionCheck = (await makeAdminApiRequest(GET_COLLECTION_QUERY, {
        id: formattedCollectionId,
      })) as any

      collectionTitle = collectionCheck?.collection?.title || id

      if (collectionCheck?.collection?.ruleSet?.rules?.length > 0) {
        return NextResponse.json(
          {
            details: [
              {
                field: ['collection'],
                message: `The collection "${collectionTitle}" is a smart collection. Smart collections automatically manage products based on rules and cannot have products added manually.`,
              },
            ],
            error: 'Cannot add products to smart collections',
          },
          { status: 400 }
        )
      }

      // Verificar si la colección está publicada
      const publicationCount = collectionCheck?.collection?.publicationCount ?? 0
      const isPublished = publicationCount > 0

      if (!isPublished) {
        // No bloqueamos, pero advertimos en los logs
      }

      // Obtener IDs de productos existentes en la colección
      if (collectionCheck?.collection?.products?.edges) {
        existingProductIds = new Set(
          collectionCheck.collection.products.edges.map((edge: any) => edge.node.id)
        )
      }
    } catch (collectionCheckError) {
      // Continuar aunque no se pueda verificar el tipo de colección
    }

    // Formatear IDs de productos
    let formattedProductIds = productIds.map((productId: string) => {
      return productId.startsWith('gid://shopify/Product/')
        ? productId
        : `gid://shopify/Product/${productId}`
    })

    // Verificar si los productos ya están en la colección
    const productsAlreadyInCollection = formattedProductIds.filter((id: string) =>
      existingProductIds.has(id)
    )

    if (productsAlreadyInCollection.length > 0) {
      // Si todos los productos ya están en la colección, retornar error
      if (productsAlreadyInCollection.length === formattedProductIds.length) {
        return NextResponse.json(
          {
            alreadyInCollection: productsAlreadyInCollection,
            details: [
              {
                field: ['productIds'],
                message: `Todos los productos seleccionados ya están en la colección "${collectionTitle}".`,
              },
            ],
            error: 'Products already in collection',
            message: `Los productos seleccionados ya están en la colección "${collectionTitle}".`,
          },
          { status: 400 }
        )
      }

      // Si solo algunos están duplicados, filtrar y continuar con los que no están
      const productsToAdd = formattedProductIds.filter(
        (id: string) => !productsAlreadyInCollection.includes(id)
      )

      if (productsToAdd.length === 0) {
        return NextResponse.json(
          {
            alreadyInCollection: productsAlreadyInCollection,
            details: [
              {
                field: ['productIds'],
                message: `Todos los productos seleccionados ya están en la colección "${collectionTitle}".`,
              },
            ],
            error: 'All products already in collection',
            message: `Todos los productos seleccionados ya están en la colección "${collectionTitle}".`,
          },
          { status: 400 }
        )
      }

      // Actualizar la lista de productos para solo incluir los que no están
      formattedProductIds = productsToAdd
    }

    const MUTATION = `
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount {
              count
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    const response = (await makeAdminApiRequest(MUTATION, variables)) as any

    if (response.collectionAddProducts?.userErrors?.length > 0) {

      // Verificar si el error es porque la colección es inteligente
      const isSmartCollectionError = response.collectionAddProducts.userErrors.some(
        (error: any) =>
          error.message?.toLowerCase().includes('smart collection') ||
          error.message?.toLowerCase().includes('cannot manually add') ||
          error.message?.toLowerCase().includes('automatic')
      )

      // Verificar si el error podría ser porque el producto ya está en la colección
      const errorMessages = response.collectionAddProducts.userErrors
        .map((e: any) => e.message)
        .join('; ')
      const mightBeDuplicate =
        errorMessages.toLowerCase().includes('already') ||
        errorMessages.toLowerCase().includes('exists') ||
        errorMessages.toLowerCase().includes('duplicate')

      let errorMessage = errorMessages

      if (isSmartCollectionError) {
        errorMessage =
          'Esta es una colección inteligente. Los productos se gestionan automáticamente según las reglas definidas y no se pueden agregar manualmente.'
      } else if (mightBeDuplicate) {
        errorMessage =
          'Uno o más productos ya están en esta colección. Verifica la lista de productos de la colección.'
      } else if (errorMessages.toLowerCase().includes('not found')) {
        errorMessage =
          'Uno o más productos no se encontraron. Verifica que los productos existan y estén activos.'
      } else if (errorMessages.toLowerCase().includes('not published')) {
        errorMessage =
          'Uno o más productos no están publicados. Publica los productos antes de agregarlos a la colección.'
      }

      return NextResponse.json(
        {
          details: response.collectionAddProducts.userErrors,
          error: 'Validation errors',
          isSmartCollection: isSmartCollectionError,
          message: errorMessage,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: response.collectionAddProducts.collection,
      statusCode: 200,
    })
  } catch (error) {
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: encodedId } = await params
    const id = decodeURIComponent(encodedId)
    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    const formattedCollectionId = id.startsWith('gid://shopify/Collection/')
      ? id
      : `gid://shopify/Collection/${id}`

    const formattedProductIds = productIds.map((productId: string) => {
      return productId.startsWith('gid://shopify/Product/')
        ? productId
        : `gid://shopify/Product/${productId}`
    })

    const MUTATION = `
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
          job {
            id
            done
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    const response = (await makeAdminApiRequest(MUTATION, variables)) as any

    if (response.collectionRemoveProducts?.userErrors?.length > 0) {
      return NextResponse.json(
        {
          details: response.collectionRemoveProducts.userErrors,
          error: 'Validation errors',
          message: response.collectionRemoveProducts.userErrors
            .map((e: any) => e.message)
            .join('; '),
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        collectionId: id,
        job: response.collectionRemoveProducts.job,
        success: true,
      },
      statusCode: 200,
    })
  } catch (error) {
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
