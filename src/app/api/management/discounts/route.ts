import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { getServerSession } from '@/src/modules/auth/server/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const type = searchParams.get('type')
    const appliesTo = searchParams.get('appliesTo')
    const search = searchParams.get('search')

    // Construir query para Shopify
    let query = 'metafield:namespace:discounts'

    if (isActive !== null) {
      query += ` AND metafield:key:isActive:${isActive}`
    }

    if (type) {
      query += ` AND metafield:key:type:${type}`
    }

    if (appliesTo) {
      query += ` AND metafield:key:appliesTo:${appliesTo}`
    }

    if (search) {
      query += ` AND metafield:key:code:*${search}*`
    }

    // Obtener productos con metafields de cupones
    const response = await makeAdminApiRequest<{
      data: {
        products: {
          edges: {
            node: {
              id: string
              title: string
              metafields: {
                edges: {
                  node: {
                    id: string
                    key: string
                    value: string
                    type: string
                  }
                }[]
              }
            }
          }[]
        }
      }
      errors?: { message: string }[]
    }>(`
      query getProductsWithDiscounts($query: String!) {
        products(first: 250, query: $query) {
          edges {
            node {
              id
              title
              metafields(first: 50, namespace: "discounts") {
                edges {
                  node {
                    id
                    key
                    value
                    type
                  }
                }
              }
            }
          }
        }
      }
    `, { query })

    if (response.errors) {
      console.error('Error en Shopify query:', response.errors)
      return NextResponse.json({ error: 'Error al obtener cupones' }, { status: 500 })
    }

    // Procesar metafields y convertirlos a cupones
    const discounts: any[] = []

    response.data.products.edges.forEach(({ node: product }: any) => {
      const discountMetafields = product.metafields.edges
        .filter((edge: any) => edge.node.namespace === 'discounts')
        .map((edge: any) => edge.node)

      if (discountMetafields.length > 0) {
        // Agrupar metafields por cupón
        const discountGroups = groupMetafieldsByDiscount(discountMetafields)

        discountGroups.forEach((discount: any) => {
          discounts.push({
            ...discount,
            productId: product.id,
            productTitle: product.title,
          })
        })
      }
    })

    return NextResponse.json(discounts)
  } catch (error) {
    console.error('Error al obtener cupones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { code, type, value, startsAt, endsAt, appliesTo, productIds, collectionIds } = body

    // Validaciones básicas
    if (!code || !type || !value || !startsAt || !appliesTo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Crear metafields para el cupón
    const metafields = [
      {
        namespace: 'discounts',
        key: code,
        type: 'json',
        value: JSON.stringify({
          type,
          value,
          startsAt,
          endsAt,
          appliesTo,
          productIds: productIds || [],
          collectionIds: collectionIds || [],
          isActive: true,
          usedCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      },
    ]

    // Aplicar metafields a productos específicos o crear un metafield global
    if (appliesTo === 'SPECIFIC_PRODUCTS' && productIds?.length > 0) {
      // Aplicar a productos específicos
      for (const productId of productIds) {
        await makeAdminApiRequest(`
          mutation createProductMetafield($input: ProductMetafieldInput!) {
            productMetafieldCreate(input: $input) {
              metafield {
                id
                key
                value
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          input: {
            productId,
            namespace: 'discounts',
            key: code,
            type: 'json',
            value: JSON.stringify({
              type,
              value,
              startsAt,
              endsAt,
              appliesTo,
              productIds: productIds || [],
              collectionIds: collectionIds || [],
              isActive: true,
              usedCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          },
        })
      }
    } else if (appliesTo === 'ALL_PRODUCTS') {
      // Crear metafield global (se puede implementar como shop metafield)
      await makeAdminApiRequest(`
        mutation createShopMetafield($input: ShopMetafieldInput!) {
          shopMetafieldCreate(input: $input) {
            metafield {
              id
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        input: {
          namespace: 'discounts',
          key: code,
          type: 'json',
          value: JSON.stringify({
            type,
            value,
            startsAt,
            endsAt,
            appliesTo,
            productIds: productIds || [],
            collectionIds: collectionIds || [],
            isActive: true,
            usedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
      })
    }

    const discount = {
      id: `discount_${code}`,
      code,
      type,
      value,
      startsAt,
      endsAt,
      appliesTo,
      productIds: productIds || [],
      collectionIds: collectionIds || [],
      isActive: true,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(discount, { status: 201 })
  } catch (error) {
    console.error('Error al crear cupón:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Función auxiliar para agrupar metafields por cupón
function groupMetafieldsByDiscount(metafields: any[]) {
  const discountGroups: any[] = []

  metafields.forEach((metafield) => {
    try {
      const discountData = JSON.parse(metafield.value)
      discountGroups.push({
        id: metafield.id,
        code: metafield.key,
        ...discountData,
      })
    } catch (error) {
      console.error('Error al parsear metafield:', error)
    }
  })

  return discountGroups
}
