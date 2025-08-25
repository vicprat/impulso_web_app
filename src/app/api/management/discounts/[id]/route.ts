import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { getServerSession } from '@/src/modules/auth/server/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { endsAt, isActive, type, value } = body

    // Extraer el código del cupón del ID
    const code = id.replace('discount_', '')

    // Buscar el metafield del cupón
    const response = await makeAdminApiRequest<{
      data: {
        metafields: {
          edges: {
            node: {
              id: string
              key: string
              value: string
              owner: {
                id: string
              }
            }
          }[]
        }
      }
      errors?: { message: string }[]
    }>(
      `
      query getDiscountMetafield($code: String!) {
        metafields(first: 1, namespace: "discounts", keys: [$code]) {
          edges {
            node {
              id
              key
              value
              owner {
                id
              }
            }
          }
        }
      }
    `,
      { code }
    )

    if (response.errors || !response.data.metafields.edges.length) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    const metafield = response.data.metafields.edges[0].node
    const currentData = JSON.parse(metafield.value)

    // Actualizar solo los campos proporcionados
    const updatedData = {
      ...currentData,
      ...(isActive !== undefined && { isActive }),
      ...(endsAt !== undefined && { endsAt }),
      ...(value !== undefined && { value }),
      ...(type !== undefined && { type }),
      updatedAt: new Date().toISOString(),
    }

    // Actualizar el metafield
    await makeAdminApiRequest(
      `
      mutation updateMetafield($input: MetafieldInput!) {
        metafieldUpdate(input: $input) {
          metafield {
            id
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        input: {
          id: metafield.id,
          value: JSON.stringify(updatedData),
        },
      }
    )

    const updatedDiscount = {
      code,
      id: `discount_${code}`,
      ...updatedData,
    }

    return NextResponse.json(updatedDiscount)
  } catch (error) {
    console.error('Error al actualizar cupón:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const code = id.replace('discount_', '')

    // Buscar todos los metafields del cupón (puede estar en múltiples productos)
    const response = await makeAdminApiRequest<{
      data: {
        metafields: {
          edges: {
            node: {
              id: string
              key: string
              value: string
              owner: {
                id: string
              }
            }
          }[]
        }
      }
      errors?: { message: string }[]
    }>(
      `
      query getDiscountMetafields($code: String!) {
        metafields(first: 250, namespace: "discounts", keys: [$code]) {
          edges {
            node {
              id
              key
              value
              owner {
                id
              }
            }
          }
        }
      }
    `,
      { code }
    )

    if (response.errors) {
      return NextResponse.json({ error: 'Error al buscar cupón' }, { status: 500 })
    }

    // Eliminar todos los metafields del cupón
    const metafields = response.data.metafields.edges
    for (const { node: metafield } of metafields) {
      await makeAdminApiRequest(
        `
        mutation deleteMetafield($input: MetafieldDeleteInput!) {
          metafieldDelete(input: $input) {
            deletedMetafieldIds
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          input: {
            id: metafield.id,
          },
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar cupón:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
