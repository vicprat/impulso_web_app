import { type NextRequest, NextResponse } from 'next/server'

import { productService } from '@/services/product/service'

import type { Product as AdminProduct } from '@/models/Product'
import type { Product as StorefrontProduct } from '@/modules/shopify/types'
import type { GetProductsParams } from '@/services/product/types'

function transformToStorefrontProduct(adminProduct: AdminProduct): StorefrontProduct {
  const firstVariant = adminProduct.variants[0]
  const minPrice = firstVariant?.price ?? { amount: '0', currencyCode: 'MXN' }
  const maxPrice = firstVariant?.price ?? { amount: '0', currencyCode: 'MXN' }

  return {
    artworkDetails: {
      artist: adminProduct.artworkDetails.artist ?? undefined,
      depth: adminProduct.artworkDetails.depth ?? undefined,
      height: adminProduct.artworkDetails.height ?? undefined,
      location: adminProduct.artworkDetails.location ?? undefined,
      medium: adminProduct.artworkDetails.medium ?? undefined,
      serie: adminProduct.artworkDetails.serie ?? undefined,
      width: adminProduct.artworkDetails.width ?? undefined,
      year: adminProduct.artworkDetails.year ?? undefined,
    },
    availableForSale: adminProduct.isAvailable,
    createdAt: '',
    description: adminProduct.descriptionHtml.replace(/<[^>]*>/g, ''),
    descriptionHtml: adminProduct.descriptionHtml,
    handle: adminProduct.handle,
    id: adminProduct.id,
    images: adminProduct.images,
    priceRange: {
      maxVariantPrice: maxPrice,
      minVariantPrice: minPrice,
    },
    productType: adminProduct.productType,
    status: adminProduct.status,
    tags: adminProduct.tags,
    title: adminProduct.title,
    updatedAt: '',
    variants: adminProduct.variants.map((v) => ({
      availableForSale: v.availableForSale,
      compareAtPrice: v.compareAtPrice,
      id: v.id,
      price: v.price,
      selectedOptions: v.selectedOptions,
      sku: v.sku,
      title: v.title,
    })),
    vendor: adminProduct.vendor,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const params: GetProductsParams = {
      artworkType: searchParams.get('artworkType') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      limit: parseInt(searchParams.get('limit') ?? '20', 10),
      location: searchParams.get('location') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'asc',
      status: 'ACTIVE',
      technique: searchParams.get('technique') ?? undefined,
      vendor: searchParams.get('vendor') ?? undefined,
    }

    const result = await productService.getProducts(params)

    const transformedProducts = result.products.map(transformToStorefrontProduct)

    return NextResponse.json({
      data: {
        pageInfo: result.pageInfo,
        products: transformedProducts,
      },
      success: true,
    })
  } catch (error) {
    console.error('Error fetching store products:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        success: false,
      },
      { status: 500 }
    )
  }
}
