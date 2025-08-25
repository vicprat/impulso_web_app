import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { PRODUCT_CREATE_MEDIA_MUTATION } from '@/services/product/queries'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const { currentImageId, newImageUrl } = await request.json()

    if (!currentImageId || !newImageUrl || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields: currentImageId, newImageUrl, productId' },
        { status: 400 }
      )
    }

    // 1. Crear la nueva imagen
    const createImageResponse = (await makeAdminApiRequest(PRODUCT_CREATE_MEDIA_MUTATION, {
      media: [{ mediaContentType: 'IMAGE', originalSource: newImageUrl }],
      productId: `gid://shopify/Product/${productId}`,
    })) as any

    if (createImageResponse.productCreateMedia?.userErrors?.length > 0) {
      return NextResponse.json(
        {
          details: createImageResponse.productCreateMedia.userErrors,
          error: 'Error creating image',
        },
        { status: 400 }
      )
    }

    const newImageId = createImageResponse.productCreateMedia?.media?.[0]?.id
    if (!newImageId) {
      return NextResponse.json(
        { error: 'Failed to create new image - no image ID returned' },
        { status: 400 }
      )
    }

    // 2. Esperar a que la imagen se procese y obtener su ID final
    let attempts = 0
    const maxAttempts = 10
    let processedImage = null

    while (attempts < maxAttempts && !processedImage) {
      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        const checkQuery = `
          query getProduct($id: ID!) {
            product(id: $id) {
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

        const checkResponse = (await makeAdminApiRequest(checkQuery, {
          id: `gid://shopify/Product/${productId}`,
        })) as any
        const images = checkResponse.product?.images?.edges || []

        // Buscar la imagen más reciente (última en la lista)
        // Esto evita problemas con URLs temporales
        const latestImage = images[images.length - 1]
        if (latestImage && !latestImage.node.url.includes('shopify-staged-uploads')) {
          processedImage = latestImage.node
        }
      } catch (error) {
        // Continue trying
      }
    }

    if (!processedImage) {
      return NextResponse.json({ error: 'Image processing timeout' }, { status: 400 })
    }

    // 3. Eliminar la imagen principal actual
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Obtener media IDs
      const getMediaQuery = `
        query getProduct($id: ID!) {
          product(id: $id) {
            media(first: 10) {
              nodes {
                id
                ... on MediaImage {
                  image { url }
                }
              }
            }
          }
        }
      `

      const mediaResponse = (await makeAdminApiRequest(getMediaQuery, {
        id: `gid://shopify/Product/${productId}`,
      })) as any

      // Obtener URL de la imagen principal actual
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
        (edge: any) => edge.node.id === currentImageId
      )?.node

      if (currentImage) {
        // Encontrar y eliminar el media correspondiente
        const currentMedia = mediaResponse.product?.media?.nodes?.find(
          (media: any) => media.image?.url === currentImage.url
        )

        if (currentMedia) {
          const deleteImageMutation = `
            mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
              productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
                deletedMediaIds
                userErrors { field message }
              }
            }
          `

          await makeAdminApiRequest(deleteImageMutation, {
            mediaIds: [currentMedia.id],
            productId: `gid://shopify/Product/${productId}`,
          })

          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    } catch (error) {
      // Continue even if deletion fails
    }

    // 4. Obtener producto final
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
      message: 'Imagen principal reemplazada exitosamente',
      product: productResponse.product,
      success: true,
    })
  } catch (error) {
    console.error('Error in replace main image endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
