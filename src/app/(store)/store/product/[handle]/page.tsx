import { notFound } from 'next/navigation'

import { generateProductMetadata } from '@/lib/metadata'
import { Product } from '@/models/Product'
import { getServerSession } from '@/modules/auth/server/server'
import { api as shopifyApi } from '@/modules/shopify/api'
import { getPrivateProductIds, getPrivateRoomByUserId } from '@/modules/shopify/service'
import { productService } from '@/services/product/service'

import { Client } from './Client'

import type { Metadata } from 'next'

interface PrivateRoomProduct {
  id: string
  privateRoomId: string
  productId: string
}

// Página dinámica - se actualiza en cada request
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params

  try {
    const response = await shopifyApi.getProductByHandle(handle)

    if (response.data) {
      const product = response.data
      return generateProductMetadata({
        artist: product.vendor,
        description: product.descriptionHtml,
        images: product.images?.edges?.map((edge: { node: { url: string } }) => edge.node.url),
        title: product.title,
      })
    }
  } catch (error) {
    console.error('Error generating product metadata:', error)
  }

  return {
    description: 'El producto que buscas no está disponible en este momento.',
    title: 'Producto no encontrado',
  }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  try {
    const session = await getServerSession()
    const privateProductIds = await getPrivateProductIds()

    let product: Product | null = null

    try {
      // Si hay sesión, usar nuestro servicio personalizado para obtener el producto enriquecido
      if (session) {
        product = await productService.getProductByHandle(handle, session)
      } else {
        // Si no hay sesión, usar el API público de Shopify que ya devuelve el formato correcto
        try {
          const response = await shopifyApi.getProductByHandle(handle)

          if (response.data) {
            // El API ya devuelve el formato correcto para el modelo Product
            product = new Product(response.data, '') // locationId será vacío para productos públicos
          }
        } catch (apiError) {
          // Si falla el API público, intentar con el servicio autenticado si hay sesión
          if (session) {
            try {
              product = await productService.getProductByHandle(handle, session)
            } catch (fallbackError) {
              throw apiError // Lanzar el error original
            }
          } else {
            // Si no hay sesión y el API público falla, mostrar 404
            notFound()
          }
        }
      }
    } catch (error) {
      product = null
    }

    if (!product) {
      notFound()
    }

    // Convertir el modelo Product a un objeto plano para evitar problemas de serialización
    const productData = {
      artworkDetails: product.artworkDetails,
      autoTags: product.autoTags,
      descriptionHtml: product.descriptionHtml,
      formattedPrice: product.formattedPrice,
      handle: product.handle,
      id: product.id,
      images: product.images,
      isAvailable: product.isAvailable,
      manualTags: product.manualTags,
      media: product.media,
      // Getters
      primaryImage: product.primaryImage,

      primaryVariant: product.primaryVariant,

      productType: product.productType,

      status: product.status,

      statusLabel: product.statusLabel,

      tags: product.tags,

      title: product.title,
      variants: product.variants,
      vendor: product.vendor,
    }

    if (privateProductIds.includes(product.id)) {
      if (!session) {
        notFound()
      }

      const userRoles = session.user.roles
      const isAdminOrManager = userRoles.includes('admin') || userRoles.includes('manager')
      const isVipCustomer = userRoles.includes('vip_customer')

      if (isAdminOrManager) {
        // Admins and managers are allowed; do nothing
      } else if (isVipCustomer) {
        try {
          const userPrivateRoom = await getPrivateRoomByUserId(session.user.id)

          if (
            !userPrivateRoom?.products.some((p: PrivateRoomProduct) => p.productId === product.id)
          ) {
            notFound()
          }
        } catch {
          notFound()
        }
      } else {
        notFound()
      }
    }

    let relatedProducts: Product[] = []
    try {
      // Obtener productos relacionados usando nuestro servicio
      if (session) {
        const relatedResponse = await productService.getProducts(
          {
            limit: 10,
            status: 'ACTIVE',
            vendor: product.vendor,
          },
          session
        )

        // Filtrar el producto actual y limitar a 6 productos relacionados
        relatedProducts = relatedResponse.products.filter((p) => p.id !== product.id).slice(0, 6)
      } else {
        // Si no hay sesión, usar el API público para productos relacionados
        const relatedResponse = await shopifyApi.getProducts({
          filters: {
            vendor: [product.vendor],
          },
          first: 10,
        })

        if (relatedResponse.data.products) {
          relatedProducts = relatedResponse.data.products
            .filter((p) => p.id !== product.id)
            .slice(0, 6)
            .map((p) => {
              // Convertir cada producto relacionado al formato correcto
              const shopifyData = {
                descriptionHtml: p.descriptionHtml,
                handle: p.handle,
                id: p.id,
                images: {
                  edges: p.images?.map((image: any) => ({ node: image })) || [],
                },
                media: {
                  nodes: [],
                },
                metafields: {
                  edges: [],
                },
                productType: p.productType,
                status: 'ACTIVE' as const,
                tags: [],
                title: p.title,
                variants: {
                  edges:
                    p.variants?.map((variant: any) => ({
                      node: {
                        availableForSale: variant.availableForSale,
                        id: variant.id,
                        inventoryItem: {
                          tracked: false,
                        },
                        inventoryPolicy: 'DENY' as const,
                        inventoryQuantity: null,
                        price: variant.price.amount,
                        sku: variant.sku,
                        title: variant.title,
                      },
                    })) || [],
                },
                vendor: p.vendor,
              }
              return new Product(shopifyData, '')
            })
        }
      }
    } catch {
      relatedProducts = []
    }

    // Convertir los productos relacionados a objetos planos
    const relatedProductsData = relatedProducts.map((product) => ({
      artworkDetails: product.artworkDetails,
      autoTags: product.autoTags,
      descriptionHtml: product.descriptionHtml,
      formattedPrice: product.formattedPrice,
      handle: product.handle,
      id: product.id,
      images: product.images,
      isAvailable: product.isAvailable,
      manualTags: product.manualTags,
      media: product.media,
      // Getters
      primaryImage: product.primaryImage,

      primaryVariant: product.primaryVariant,

      productType: product.productType,

      status: product.status,

      statusLabel: product.statusLabel,

      tags: product.tags,

      title: product.title,
      variants: product.variants,
      vendor: product.vendor,
    }))

    return <Client product={productData} relatedProducts={relatedProductsData} />
  } catch {
    notFound()
  }
}
