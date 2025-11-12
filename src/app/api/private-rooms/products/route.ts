import { NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

const GET_PRODUCTS_BY_IDS_QUERY = `
  query getProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        descriptionHtml
        vendor
        productType
        status
        tags
        createdAt
        updatedAt
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
              sku
              inventoryQuantity
              selectedOptions {
                name
                value
              }
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

export async function POST(req: Request) {
  try {
    await requirePermission(PERMISSIONS.VIEW_PRIVATE_ROOMS)
    const { productIds } = await req.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'productIds array is required' }, { status: 400 })
    }

    const formattedIds = productIds.map((id) =>
      id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
    )

    const response = await makeAdminApiRequest<{ nodes: any[] }>(GET_PRODUCTS_BY_IDS_QUERY, {
      ids: formattedIds,
    })

    const products = response.nodes
      .filter((node) => node !== null)
      .map((product: any) => ({
        availableForSale: product.status === 'ACTIVE',
        createdAt: product.createdAt ?? new Date().toISOString(),
        description: product.descriptionHtml ?? '',
        descriptionHtml: product.descriptionHtml ?? '',
        handle: product.handle ?? '',
        id: product.id,
        images:
          product.images?.edges?.map((edge: any) => ({
            altText: edge.node.altText,
            height: edge.node.height,
            id: edge.node.id,
            url: edge.node.url,
            width: edge.node.width,
          })) ?? [],
        priceRange: {
          maxVariantPrice: {
            amount: product.priceRange?.maxVariantPrice?.amount ?? '0',
            currencyCode: product.priceRange?.maxVariantPrice?.currencyCode ?? 'MXN',
          },
          minVariantPrice: {
            amount: product.priceRange?.minVariantPrice?.amount ?? '0',
            currencyCode: product.priceRange?.minVariantPrice?.currencyCode ?? 'MXN',
          },
        },
        productType: product.productType ?? '',
        status: product.status,
        tags: product.tags ?? [],
        title: product.title,
        updatedAt: product.updatedAt ?? new Date().toISOString(),
        variants:
          product.variants?.edges?.map((edge: any) => ({
            availableForSale: edge.node.inventoryQuantity > 0 && product.status === 'ACTIVE',
            compareAtPrice: edge.node.compareAtPrice
              ? {
                  amount: edge.node.compareAtPrice,
                  currencyCode: product.priceRange?.minVariantPrice?.currencyCode ?? 'MXN',
                }
              : null,
            id: edge.node.id,
            inventoryQuantity: edge.node.inventoryQuantity ?? 0,
            price: {
              amount: edge.node.price ?? '0',
              currencyCode: product.priceRange?.minVariantPrice?.currencyCode ?? 'MXN',
            },
            selectedOptions: edge.node.selectedOptions ?? [],
            sku: edge.node.sku,
            title: edge.node.title,
          })) ?? [],
        vendor: product.vendor ?? '',
      }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products from Admin API:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
