import { NextResponse, type NextRequest } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { PRODUCT_CREATE_MEDIA_MUTATION } from '@/services/product/queries'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const { currentImageId, newImageUrl } = await request.json()

    if (!newImageUrl || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields: newImageUrl, productId' },
        { status: 400 }
      )
    }

    const hasExistingImage = currentImageId !== null && currentImageId !== undefined

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
    let processedImage: { id: string; url: string; altText?: string } | null = null

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

    // 3. Eliminar la imagen principal actual (solo si existe)
    if (hasExistingImage) {
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
                    image { 
                      id
                      url 
                    }
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
            (media: any) =>
              media.image?.id === currentImageId || media.image?.url === currentImage.url
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
    }

    // 4. Reordenar para poner la nueva imagen primero
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const getMediaForReorderQuery = `
        query getProduct($id: ID!) {
          product(id: $id) {
            media(first: 10) {
              nodes {
                id
                ... on MediaImage {
                  image {
                    id
                  }
                }
              }
            }
          }
        }
      `

      const reorderResponse = (await makeAdminApiRequest(getMediaForReorderQuery, {
        id: `gid://shopify/Product/${productId}`,
      })) as any

      const mediaNodes = reorderResponse.product?.media?.nodes || []
      const newMediaNode = mediaNodes.find((media: any) => media.id === newImageId)

      if (newMediaNode && mediaNodes.length > 1) {
        // Crear el array reordenado con la nueva imagen primero
        const otherMediaIds = mediaNodes
          .filter((media: any) => media.id !== newImageId)
          .map((media: any) => media.id)

        const reorderedMediaIds = [newImageId, ...otherMediaIds]

        // Construir los movimientos para productReorderMedia
        const moves = reorderedMediaIds.map((mediaId: string, index: number) => ({
          id: mediaId,
          newPosition: index + 1, // Las posiciones en Shopify comienzan en 1
        }))

        const reorderMutation = `
          mutation productReorderMedia($productId: ID!, $moves: [MoveInput!]!) {
            productReorderMedia(productId: $productId, moves: $moves) {
              job {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `

        const reorderResult = (await makeAdminApiRequest(reorderMutation, {
          moves,
          productId: `gid://shopify/Product/${productId}`,
        })) as any

        if (reorderResult.productReorderMedia?.userErrors?.length > 0) {
          console.error('Error reordering media:', reorderResult.productReorderMedia.userErrors)
        } else {
          // Esperar un poco para que se complete el reordenamiento
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    } catch (error) {
      console.error('Error in reorder step:', error)
      // Continue even if reorder fails
    }

    // 5. Obtener producto final (esperar un poco más para asegurar que el reordenamiento se completó)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let finalAttempts = 0
    let productResponse = null

    while (finalAttempts < 3) {
      finalAttempts++
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

      productResponse = (await makeAdminApiRequest(getProductQuery, {
        id: `gid://shopify/Product/${productId}`,
      })) as any

      // Verificar que la primera imagen no sea una URL temporal
      const firstImage = productResponse?.product?.images?.edges?.[0]?.node
      if (firstImage && !firstImage.url.includes('shopify-staged-uploads')) {
        break
      }
    }

    if (!productResponse) {
      return NextResponse.json({ error: 'Failed to get final product' }, { status: 500 })
    }

    // Asegurar que la nueva imagen esté primero en la respuesta
    if (!processedImage) {
      return NextResponse.json({ error: 'Processed image not found' }, { status: 500 })
    }

    // TypeScript ahora sabe que processedImage no es null
    const processedImageId = processedImage.id
    const images = productResponse.product?.images?.edges || []
    const newImageInList = images.find((edge: any) => edge.node.id === processedImageId)

    let finalImages = images
    if (newImageInList && images[0]?.node?.id !== newImageInList.node.id) {
      finalImages = [
        newImageInList,
        ...images.filter((edge: any) => edge.node.id !== newImageInList.node.id),
      ]
    }

    return NextResponse.json({
      message: 'Imagen principal reemplazada exitosamente',
      product: {
        ...productResponse.product,
        images: {
          edges: finalImages,
        },
      },
      success: true,
    })
  } catch (error) {
    console.error('Error in replace main image endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
