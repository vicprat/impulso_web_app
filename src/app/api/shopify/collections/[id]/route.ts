import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: encodedId } = await params
    const id = decodeURIComponent(encodedId)

    const QUERY = `
      query getCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          updatedAt
          image {
            id
            url
            altText
            width
            height
          }
          productsCount {
            count
          }
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
                title
                handle
              }
            }
          }
        }
      }
    `

    const response = (await makeAdminApiRequest(QUERY, {
      id: id.startsWith('gid://shopify/Collection/') ? id : `gid://shopify/Collection/${id}`,
    })) as { collection?: any }

    if (!response.collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    const collection = {
      ...response.collection,
      description: response.collection.descriptionHtml,
      products: response.collection.products.edges.map((edge: { node: any }) => edge.node),
      productsCount: response.collection.productsCount?.count ?? 0,
    }

    return NextResponse.json({
      data: collection,
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: encodedId } = await params
    const id = decodeURIComponent(encodedId)
    const body = await request.json()
    const { description, handle, image, ruleSet, title } = body

    const input: Record<string, unknown> = {
      id: id.startsWith('gid://shopify/Collection/') ? id : `gid://shopify/Collection/${id}`,
    }

    if (title) {
      input.title = title
    }

    if (description !== undefined) {
      input.descriptionHtml = description
    }

    if (handle) {
      input.handle = handle
    }

    if (image) {
      input.image = image
    }

    if (ruleSet) {
      input.ruleSet = ruleSet
    }

    const MUTATION = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
            handle
            descriptionHtml
            updatedAt
            image {
              id
              url
              altText
              width
              height
            }
            productsCount {
              count
            }
            ruleSet {
              appliedDisjunctively
              rules {
                column
                relation
                condition
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = (await makeAdminApiRequest(MUTATION, { input })) as { collectionUpdate: any }

    if (response.collectionUpdate.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.collectionUpdate.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        ...response.collectionUpdate.collection,
        description: response.collectionUpdate.collection.descriptionHtml,
        productsCount: response.collectionUpdate.collection.productsCount?.count ?? 0,
      },
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error updating collection:', error)
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

    const MUTATION = `
      mutation collectionDelete($input: CollectionDeleteInput!) {
        collectionDelete(input: $input) {
          deletedCollectionId
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = (await makeAdminApiRequest(MUTATION, {
      input: {
        id: id.startsWith('gid://shopify/Collection/') ? id : `gid://shopify/Collection/${id}`,
      },
    })) as { collectionDelete: any }

    if (response.collectionDelete.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.collectionDelete.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: { deletedCollectionId: response.collectionDelete.deletedCollectionId },
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
