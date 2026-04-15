import { notFound } from 'next/navigation'

import { CacheManager } from '@/lib/cache'
import { generateProductMetadata } from '@/lib/metadata'
import { Product } from '@/models/Product'
import { getServerSession } from '@/modules/auth/server/server'
import { api as shopifyApi } from '@/modules/shopify/api'
import { productService } from '@/services/product/service'

import { Client } from './Client'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params

  try {
    const catalog = await CacheManager.getFullCatalog('storefront')
    const cachedProduct = catalog.find((p) => p.handle === handle)

    if (cachedProduct) {
      return generateProductMetadata({
        artist: cachedProduct.vendor,
        description: cachedProduct.descriptionHtml || '',
        images: cachedProduct.images?.map((img: any) => img.url) || [],
        title: cachedProduct.title,
      })
    }

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
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('not found') || errorMessage.includes('Not Found')) {
      console.warn(`Product metadata: Product not found for handle "${handle}"`)
    } else {
      console.error('Error generating product metadata:', error)
    }
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

    let product: Product | null = null
    let cachedProduct: any = null

    try {
      if (session) {
        product = await productService.getProductByHandle(handle, session)
      } else {
        try {
          const catalog = await CacheManager.getFullCatalog('storefront')
          cachedProduct = catalog.find((p) => p.handle === handle)

          if (cachedProduct) {
            product = new Product(
              {
                createdAt: cachedProduct.createdAt || '',
                descriptionHtml: cachedProduct.descriptionHtml || '',
                handle: cachedProduct.handle,
                id: cachedProduct.id,
                images: {
                  edges: (cachedProduct.images || []).map((img: any) => ({ node: img })),
                },
                media: { nodes: [] },
                metafields: { edges: [] },
                productType: cachedProduct.productType || '',
                status: cachedProduct.status || 'ACTIVE',
                tags: cachedProduct.tags || [],
                title: cachedProduct.title,
                updatedAt: cachedProduct.updatedAt || '',
                variants: {
                  edges: (cachedProduct.variants || []).map((v: any) => ({ node: v })),
                },
                vendor: cachedProduct.vendor,
              },
              cachedProduct.primaryLocationId || ''
            )
          } else {
            const response = await shopifyApi.getProductByHandle(handle)
            if (response.data) {
              product = new Product(response.data, '')
            }
          }
        } catch (_cacheError) {
          const response = await shopifyApi.getProductByHandle(handle)
          if (response.data) {
            product = new Product(response.data, '')
          }
        }
      }
    } catch (_error) {
      product = null
    }

    if (!product) {
      notFound()
    }

    const confirmedProduct = product as Product

    const artworkDetails = cachedProduct?.artworkDetails || confirmedProduct.artworkDetails

    const productData = {
      artworkDetails,
      autoTags: confirmedProduct.autoTags,
      descriptionHtml: confirmedProduct.descriptionHtml,
      formattedPrice: confirmedProduct.formattedPrice,
      handle: confirmedProduct.handle,
      id: confirmedProduct.id,
      images: confirmedProduct.images,
      isAvailable: confirmedProduct.isAvailable,
      manualTags: confirmedProduct.manualTags,
      media: confirmedProduct.media,

      primaryImage: confirmedProduct.primaryImage,

      primaryVariant: confirmedProduct.primaryVariant,

      productType: confirmedProduct.productType,

      status: confirmedProduct.status,

      statusLabel: confirmedProduct.statusLabel,

      tags: confirmedProduct.tags,

      title: confirmedProduct.title,
      variants: confirmedProduct.variants,
      vendor: confirmedProduct.vendor,
    }

    let relatedProducts: Product[] = []
    try {
      if (session) {
        const relatedResponse = await productService.getProducts(
          {
            limit: 10,
            status: 'ACTIVE',
            vendor: confirmedProduct.vendor,
          },
          session
        )

        relatedProducts = relatedResponse.products
          .filter((p) => p.id !== confirmedProduct.id)
          .slice(0, 6)
      } else {
        const relatedResponse = await shopifyApi.getProducts({
          filters: {
            vendor: [confirmedProduct.vendor],
          },
          first: 10,
        })

        if (relatedResponse.data.products) {
          relatedProducts = relatedResponse.data.products
            .filter((p) => p.id !== confirmedProduct.id)
            .slice(0, 6)
            .map((p) => {
              const shopifyData = {
                createdAt: p.createdAt,
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
                updatedAt: p.updatedAt,
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
