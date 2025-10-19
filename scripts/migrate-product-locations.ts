import { prisma } from '@/lib/prisma'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  vendor: string
  metafields: {
    edges: {
      node: {
        namespace: string
        key: string
        value: string
      }
    }[]
  }
}

interface GetProductsResponse {
  products: {
    edges: {
      cursor: string
      node: ShopifyProduct
    }[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          title
          handle
          vendor
          metafields(first: 20, namespace: "art_details") {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

async function getAllProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = []
  let hasNextPage = true
  let cursor: string | null = null
  let page = 1

  console.log('🔍 Obteniendo productos de Shopify...')

  while (hasNextPage) {
    const response: GetProductsResponse = await makeAdminApiRequest<GetProductsResponse>(
      GET_ALL_PRODUCTS_QUERY,
      cursor ? { cursor } : {}
    )

    const fetchedProducts = response.products.edges.map(
      (edge: { node: ShopifyProduct }) => edge.node
    )
    products.push(...fetchedProducts)

    hasNextPage = response.products.pageInfo.hasNextPage
    cursor = response.products.pageInfo.endCursor

    console.log(
      `  ✓ Página ${page}: ${fetchedProducts.length} productos (Total: ${products.length})`
    )
    page++
  }

  console.log(`\n✅ Total de productos obtenidos: ${products.length}\n`)
  return products
}

function extractLocation(product: ShopifyProduct): string | null {
  const locationMetafield = product.metafields.edges.find(
    (edge: { node: { namespace: string; key: string; value: string } }) =>
      edge.node.key === 'location'
  )
  return locationMetafield?.node.value ?? null
}

async function migrateProductLocations() {
  console.log('🚀 Iniciando migración de ubicaciones de productos\n')
  console.log('='.repeat(60))

  try {
    // Paso 1: Obtener todos los productos de Shopify
    const products = await getAllProducts()

    // Paso 2: Extraer ubicaciones únicas
    console.log('📍 Extrayendo ubicaciones únicas...')
    const locationNames = new Set<string>()
    const productsWithLocation: {
      product: ShopifyProduct
      location: string
    }[] = []

    products.forEach((product) => {
      const location = extractLocation(product)
      if (location) {
        locationNames.add(location)
        productsWithLocation.push({ location, product })
      }
    })

    console.log(`  ✓ Ubicaciones únicas encontradas: ${locationNames.size}`)
    console.log(`  ✓ Productos con ubicación: ${productsWithLocation.length}`)
    console.log(`  ✓ Productos sin ubicación: ${products.length - productsWithLocation.length}\n`)

    // Paso 3: Sincronizar tabla Location
    console.log('📦 Sincronizando tabla Location...')
    const existingLocations = await prisma.location.findMany()
    const existingLocationNames = new Set(existingLocations.map((loc) => loc.name))

    const newLocationNames = Array.from(locationNames).filter(
      (name) => !existingLocationNames.has(name)
    )

    if (newLocationNames.length > 0) {
      console.log(`  → Creando ${newLocationNames.length} ubicaciones nuevas:`)
      for (const name of newLocationNames) {
        await prisma.location.create({
          data: { name },
        })
        console.log(`    ✓ ${name}`)
      }
    } else {
      console.log('  ✓ No hay ubicaciones nuevas por crear')
    }

    // Obtener todas las ubicaciones actualizadas
    const allLocations = await prisma.location.findMany()
    const locationMap = new Map(allLocations.map((loc) => [loc.name, loc.id]))
    console.log(`  ✓ Total de ubicaciones en DB: ${allLocations.length}\n`)

    // Paso 4: Poblar tabla Product
    console.log('🏗️  Poblando tabla Product...')
    let createdProducts = 0
    let updatedProducts = 0

    for (const shopifyProduct of products) {
      const numericId = shopifyProduct.id.split('/').pop()
      if (!numericId) continue

      const location = extractLocation(shopifyProduct)
      const locationId = location ? locationMap.get(location) : null

      const existingProduct = await prisma.product.findUnique({
        where: { id: numericId },
      })

      if (existingProduct) {
        await prisma.product.update({
          data: {
            currentLocationId: locationId ?? null,
            handle: shopifyProduct.handle,
            title: shopifyProduct.title,
            vendor: shopifyProduct.vendor,
          },
          where: { id: numericId },
        })
        updatedProducts++
      } else {
        await prisma.product.create({
          data: {
            currentLocationId: locationId ?? null,
            handle: shopifyProduct.handle,
            id: numericId,
            shopifyGid: shopifyProduct.id,
            title: shopifyProduct.title,
            vendor: shopifyProduct.vendor,
          },
        })
        createdProducts++
      }
    }

    console.log(`  ✓ Productos creados: ${createdProducts}`)
    console.log(`  ✓ Productos actualizados: ${updatedProducts}\n`)

    // Paso 5: Crear registros iniciales en LocationHistory
    console.log('📝 Creando registros iniciales en LocationHistory...')
    let historyCreated = 0

    for (const { location, product } of productsWithLocation) {
      const numericId = product.id.split('/').pop()
      if (!numericId) continue

      const locationId = locationMap.get(location)
      if (!locationId) continue

      // Verificar si ya existe un registro de historial
      const existingHistory = await prisma.locationHistory.findFirst({
        where: { productId: numericId },
      })

      if (!existingHistory) {
        await prisma.locationHistory.create({
          data: {
            locationId,
            productId: numericId,
          },
        })
        historyCreated++
      }
    }

    console.log(`  ✓ Registros de historial creados: ${historyCreated}\n`)

    // Resumen final
    console.log('='.repeat(60))
    console.log('✅ MIGRACIÓN COMPLETADA CON ÉXITO\n')
    console.log('📊 Resumen:')
    console.log(`  • Total de productos procesados: ${products.length}`)
    console.log(`  • Ubicaciones en la base de datos: ${allLocations.length}`)
    console.log(`  • Productos con ubicación: ${productsWithLocation.length}`)
    console.log(`  • Registros de historial creados: ${historyCreated}`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n❌ Error durante la migración:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar migración
migrateProductLocations()
  .then(() => {
    console.log('\n🎉 Script de migración finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script de migración falló:', error)
    process.exit(1)
  })
