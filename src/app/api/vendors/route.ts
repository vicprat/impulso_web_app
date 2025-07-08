import { NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

const GET_PRODUCT_VENDORS_QUERY = `
  query getProductVendors {
    shop {
      productVendors(first: 250) {
        edges {
          node
        }
      }
    }
  }
`

interface ShopifyVendorsResponse {
  shop: {
    productVendors: {
      edges: { node: string }[]
    }
  }
}

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const response = await makeAdminApiRequest<ShopifyVendorsResponse>(GET_PRODUCT_VENDORS_QUERY)

    const vendors = response.shop.productVendors.edges.map((edge) => edge.node)

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error al obtener los vendors de Shopify:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
