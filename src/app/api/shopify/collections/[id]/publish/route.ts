import { NextResponse, type NextRequest } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

const GET_PUBLICATIONS_QUERY = `
  query getPublications {
    publications(first: 20) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: encodedId } = await params
    const id = decodeURIComponent(encodedId)
    const collectionId = id.startsWith('gid://shopify/Collection/')
      ? id
      : `gid://shopify/Collection/${id}`

    // Obtener las publicaciones disponibles
    const publicationsResponse = await makeAdminApiRequest<{
      publications: { edges: { node: { id: string; name: string } }[] }
    }>(GET_PUBLICATIONS_QUERY, {})

    const publications = publicationsResponse.publications.edges.map((edge) => edge.node)
    const publicationInputs = publications.map((pub) => ({
      publicationId: pub.id,
    }))

    if (publicationInputs.length === 0) {
      return NextResponse.json({ error: 'No hay publicaciones disponibles' }, { status: 400 })
    }

    const PUBLISH_MUTATION = `
      mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await makeAdminApiRequest<{
      publishablePublish: { userErrors: { field: string[]; message: string }[] }
    }>(PUBLISH_MUTATION, {
      id: collectionId,
      input: publicationInputs,
    })

    if (response.publishablePublish.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.publishablePublish.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        id: collectionId,
        published: true,
      },
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error publishing collection:', error)
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
    const collectionId = id.startsWith('gid://shopify/Collection/')
      ? id
      : `gid://shopify/Collection/${id}`

    // Obtener las publicaciones disponibles
    const publicationsResponse = await makeAdminApiRequest<{
      publications: { edges: { node: { id: string; name: string } }[] }
    }>(GET_PUBLICATIONS_QUERY, {})

    const publications = publicationsResponse.publications.edges.map((edge) => edge.node)
    const publicationInputs = publications.map((pub) => ({
      publicationId: pub.id,
    }))

    if (publicationInputs.length === 0) {
      return NextResponse.json({ error: 'No hay publicaciones disponibles' }, { status: 400 })
    }

    const UNPUBLISH_MUTATION = `
      mutation publishableUnpublish($id: ID!, $input: [PublicationInput!]!) {
        publishableUnpublish(id: $id, input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await makeAdminApiRequest<{
      publishableUnpublish: { userErrors: { field: string[]; message: string }[] }
    }>(UNPUBLISH_MUTATION, {
      id: collectionId,
      input: publicationInputs,
    })

    if (response.publishableUnpublish.userErrors.length > 0) {
      return NextResponse.json(
        { details: response.publishableUnpublish.userErrors, error: 'Validation errors' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        id: collectionId,
        published: false,
      },
      statusCode: 200,
    })
  } catch (error) {
    console.error('Error unpublishing collection:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
