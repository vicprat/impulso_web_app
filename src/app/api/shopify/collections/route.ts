import { NextResponse, type NextRequest } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ?? '50'
    const cursor = searchParams.get('cursor')
    const _query = searchParams.get('query') ?? ''

    const variables: Record<string, unknown> = {
      first: parseInt(limit),
    }

    if (cursor) {
      variables.after = cursor
    }

    const QUERY = `
      query getCollections($first: Int!, $after: String, $query: String) {
        collections(first: $first, after: $after, query: $query) {
          edges {
            node {
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
              publicationCount
              ruleSet {
                appliedDisjunctively
                rules {
                  column
                  relation
                  condition
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `

    const response = (await makeAdminApiRequest(QUERY, variables)) as any

    const collections = response.collections.edges.map((edge: any) => ({
      description: edge.node.description,
      descriptionHtml: edge.node.descriptionHtml,
      handle: edge.node.handle,
      id: edge.node.id,
      image: edge.node.image,
      productsCount: edge.node.productsCount?.count ?? 0,
      publicationCount: edge.node.publicationCount ?? 0,
      publishedOnCurrentPublication: (edge.node.publicationCount ?? 0) > 0,
      ruleSet: edge.node.ruleSet,
      title: edge.node.title,
      updatedAt: edge.node.updatedAt,
    }))

    return NextResponse.json({
      data: {
        collections,
        pageInfo: response.collections.pageInfo,
      },
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error in collections API:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, handle, image, products, ruleSet, title } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const input: Record<string, unknown> = {
      title,
    }

    if (description) {
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

    if (products && Array.isArray(products)) {
      input.products = products.map((productId: string) => ({
        id: productId,
      }))
    }

    const MUTATION = `
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
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

    const response = (await makeAdminApiRequest(MUTATION, { input })) as any

    if (response.collectionCreate.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.collectionCreate.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        ...response.collectionCreate.collection,
        description: response.collectionCreate.collection.descriptionHtml,
        productsCount: response.collectionCreate.collection.productsCount?.count || 0,
        sellingGroupGids: [],
      },
      statusCode: 201,
    })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
