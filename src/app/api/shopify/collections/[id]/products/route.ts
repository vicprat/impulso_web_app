import { type NextRequest, NextResponse } from 'next/server'

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

    const response = (await makeAdminApiRequest(MUTATION, {
      id: id.startsWith('gid://shopify/Collection/') ? id : `gid://shopify/Collection/${id}`,
      productIds: productIds.map((productId: string) =>
        productId.startsWith('gid://shopify/Product/')
          ? productId
          : `gid://shopify/Product/${productId}`
      ),
    })) as any

    if (response.collectionAddProducts.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.collectionAddProducts.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: response.collectionAddProducts.collection,
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error adding products to collection:', error)
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

    const MUTATION = `
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
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

    const response = (await makeAdminApiRequest(MUTATION, {
      id: id.startsWith('gid://shopify/Collection/') ? id : `gid://shopify/Collection/${id}`,
      productIds: productIds.map((productId: string) =>
        productId.startsWith('gid://shopify/Product/')
          ? productId
          : `gid://shopify/Product/${productId}`
      ),
    })) as any

    if (response.collectionRemoveProducts.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.collectionRemoveProducts.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: response.collectionRemoveProducts.collection,
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error removing products from collection:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
