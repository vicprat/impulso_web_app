import { NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { Product } from '@/models/Product'
import { requirePermission } from '@/modules/auth/server/server'
import { getPrimaryLocationId } from '@/services/product/service'
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
        media(first: 10) {
          nodes {
            id
            mediaContentType
            status
            ... on MediaImage {
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price
              sku
              inventoryQuantity
              inventoryPolicy
              inventoryItem {
                tracked
              }
            }
          }
        }
        metafields(first: 20) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
        collections(first: 50) {
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

    const locationId = await getPrimaryLocationId()

    const products = response.nodes
      .filter((node) => node !== null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((productData: any) => new Product(productData, locationId))

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
