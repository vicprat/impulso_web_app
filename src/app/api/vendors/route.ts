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

const GET_PRODUCTS_BY_VENDOR_QUERY = `
  query getProductsByVendor($vendor: String!) {
    products(first: 250, query: $vendor) {
      edges {
        node {
          id
          vendor
        }
      }
    }
  }
`

const UPDATE_PRODUCT_VENDOR_MUTATION = `
  mutation updateProductVendor($id: ID!, $vendor: String!) {
    productUpdate(input: { id: $id, vendor: $vendor }) {
      product {
        id
        vendor
      }
      userErrors {
        field
        message
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

interface ShopifyProductsResponse {
  products: {
    edges: { node: { id: string; vendor: string } }[]
  }
}

interface UpdateProductResponse {
  productUpdate: {
    product: { id: string; vendor: string }
    userErrors: { field: string; message: string }[]
  }
}

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_INVENTORY)

    const response = await makeAdminApiRequest<ShopifyVendorsResponse>(GET_PRODUCT_VENDORS_QUERY)

    const vendors = response.shop.productVendors.edges.map((edge) => edge.node)

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error al obtener los vendors de Shopify:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_INVENTORY)

    const body = await req.json()
    const { newVendor, oldVendor } = body

    if (!oldVendor || !newVendor) {
      return NextResponse.json({ error: 'oldVendor y newVendor son requeridos' }, { status: 400 })
    }

    if (oldVendor === newVendor) {
      return NextResponse.json({ error: 'El nombre no ha cambiado' }, { status: 400 })
    }

    const searchQuery = `vendor:${oldVendor}`
    const productsResponse = await makeAdminApiRequest<ShopifyProductsResponse>(
      GET_PRODUCTS_BY_VENDOR_QUERY,
      { vendor: searchQuery }
    )

    const products = productsResponse.products.edges
    let updatedCount = 0
    const errors: string[] = []

    for (const productEdge of products) {
      try {
        const updateResponse = await makeAdminApiRequest<UpdateProductResponse>(
          UPDATE_PRODUCT_VENDOR_MUTATION,
          {
            id: productEdge.node.id,
            vendor: newVendor,
          }
        )

        if (updateResponse.productUpdate.userErrors.length > 0) {
          errors.push(
            `Error en producto ${productEdge.node.id}: ${updateResponse.productUpdate.userErrors[0].message}`
          )
        } else {
          updatedCount++
        }
      } catch (err) {
        errors.push(`Error actualizando producto ${productEdge.node.id}`)
      }
    }

    return NextResponse.json({
      errors: errors.length > 0 ? errors : undefined,
      success: true,
      updatedCount,
    })
  } catch (error) {
    console.error('Error al actualizar vendors en Shopify:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
