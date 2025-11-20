import { NextResponse, type NextRequest } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { imageId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Missing required field: productId' }, { status: 400 })
    }

    if (!imageId) {
      return NextResponse.json({ error: 'Missing required field: imageId' }, { status: 400 })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const getMediaQuery = `
      query getProduct($id: ID!) {
        product(id: $id) {
          media(first: 10) {
            nodes {
              id
              ... on MediaImage {
                image { url id }
              }
            }
          }
        }
      }
    `

    const mediaResponse = (await makeAdminApiRequest(getMediaQuery, {
      id: `gid://shopify/Product/${productId}`,
    })) as any

    const getCurrentImageQuery = `
      query getProduct($id: ID!) {
        product(id: $id) {
          images(first: 10) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }
    `

    const currentImageResponse = (await makeAdminApiRequest(getCurrentImageQuery, {
      id: `gid://shopify/Product/${productId}`,
    })) as any

    const currentImage = currentImageResponse.product?.images?.edges?.find(
      (edge: any) => edge.node.id === imageId
    )?.node

    if (!currentImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const currentMedia = mediaResponse.product?.media?.nodes?.find(
      (media: any) => media.image?.id === imageId || media.image?.url === currentImage.url
    )

    if (!currentMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const deleteImageMutation = `
      mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          deletedMediaIds
          userErrors { field message }
        }
      }
    `

    const deleteResponse = (await makeAdminApiRequest(deleteImageMutation, {
      mediaIds: [currentMedia.id],
      productId: `gid://shopify/Product/${productId}`,
    })) as any

    if (deleteResponse.productDeleteMedia?.userErrors?.length > 0) {
      return NextResponse.json(
        {
          details: deleteResponse.productDeleteMedia.userErrors,
          error: 'Error deleting image',
        },
        { status: 400 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const getProductQuery = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
        }
      }
    `

    const productResponse = (await makeAdminApiRequest(getProductQuery, {
      id: `gid://shopify/Product/${productId}`,
    })) as any

    return NextResponse.json({
      message: 'Imagen principal removida exitosamente',
      product: productResponse.product,
      success: true,
    })
  } catch (error) {
    console.error('Error in remove main image endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
